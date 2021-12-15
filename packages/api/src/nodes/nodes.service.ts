import { Injectable, Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import { ConfigService } from 'src/config/config.service';
import { NodeState, OS } from './interfaces/NodeState.interfaces';
import * as yaml from 'yaml';
import { Inventory, AnsibleHost } from './interfaces/Inventory.interface';
import SSH2Promise from 'ssh2-promise';
import wait from 'wait';
import TFTP from 'tftp';
import { HttpService } from '@nestjs/axios';
import { BootOptions } from 'src/config/interfaces/boot-options.interface';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';
import { BootTokenCreateDto } from './dto/boot-token-create.dto';
import { DateTime } from 'luxon';

@Injectable()
export class NodesService {
  private states = new Map<AnsibleHost, NodeState>();
  private bootTargets = new Map<AnsibleHost, OS>();
  private logger = new Logger(NodesService.name);
  readonly waitShutdownPeriods = 60;
  readonly waitBootPeriods = 30;
  readonly bootOptions: BootOptions;
  readonly studentUsername: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private jwtService: JwtService,
  ) {
    this.initStates();
    this.bootOptions = configService.createBootOptions();
    this.studentUsername = configService.createStudentOptions().username;

    const tftp = TFTP.createServer(
      {
        host: '0.0.0.0',
        ...configService.createTftpOptions(),
      },
      this.handleTFTP.bind(this),
    );
    tftp.on('error', (e) => {
      this.logger.error(e);
    });
    tftp.listen();
  }

  private initStates() {
    this.states.clear();
    const p = this.configService.createInventoryPath();
    const inventory = readFileSync(p, { encoding: 'utf-8' });
    const parsed = yaml.parse(inventory) as Inventory;

    Object.entries(parsed.kubernetes.children.worker.hosts || {}).forEach(
      ([fqdn, host]) => {
        const state: NodeState = {
          timestamp: new Date().getTime(),

          mac: host.mac_address,
          host: host.ansible_host,
          fqdn,
          name: host.name,

          alive: false,
          os: OS.WINDOWS,
          loadAvg: '0.00 0.00 0.00',
          actionPending: false,

          username: host.username,
          usernameWindows: host.username_windows,
        };
        this.setState(state);
        this.bootTargets.set(state.host, OS.WINDOWS);
      },
    );
  }

  public getState(host: string) {
    if (!this.states.has(host)) throw new Error(`Invalid node host ${host}`);
    return this.states.get(host);
  }

  public getStates() {
    return [...this.states.values()];
  }

  public setState(state: NodeState) {
    return this.states.set(state.host, state);
  }

  public async checkState(state: NodeState) {
    const newState = { ...state };
    newState.timestamp = new Date().getTime();
    // Check every user starting with ubuntu
    for (const username of [state.username, state.usernameWindows]) {
      const ssh = this.getSSHConnection(state, username);
      try {
        newState.alive = true;
        // If this command works then it's ubuntu
        const loadAvg: string = await ssh.exec('cat', ['/proc/loadavg']);
        newState.loadAvg = loadAvg.substr(0, 14);
        newState.os = OS.UBUNTU;
        await ssh.close();
        break;
      } catch (e) {
        // If fails with ssh error (level in object) then it's dead
        if ('level' in e) {
          newState.alive = false;
          // Check next username
        }
        // If fails with other error (/proc/loadavg not found) then it's windows
        else {
          newState.os = OS.WINDOWS;
          break;
        }
      }
    }
    this.logger.verbose(
      `[Node ${state.host}] State check {alive: ${newState.alive}, os: ${newState.os}, actionPending: ${newState.actionPending}}`,
    );
    return newState;
  }

  public async shutdown(state: NodeState) {
    const ssh = this.getSSHConnection(state);
    let afterState: NodeState;
    try {
      this.logger.log(`[Node ${state.host}] Opening SSH connection`);
      await ssh.connect();
      this.logger.log(`[Node ${state.host}] SSH connection opened`);

      if (state.os === OS.UBUNTU) await ssh.exec('sudo', ['shutdown', 'now']);
      else await ssh.exec('shutdown', ['-s', '-t', '0']);
      this.logger.log(`[Node ${state.host}] Shutdown requested`);
      await ssh.close();

      /** Wait for shutdown */
      let waitPeriods = this.waitShutdownPeriods;
      do {
        await wait(1000);
        afterState = await this.checkState(state);
        this.setState(afterState);
        this.logger.log(`[Node ${state.host}] Shutdown check (${waitPeriods})`);
      } while (waitPeriods-- > 0 && afterState.alive);

      if (waitPeriods >= 0) this.logger.log(`[Node ${state.host}] Shutdown`);
      else this.logger.error(`[Node ${state.host}] Shutdown timeout`);

      return afterState;
    } catch (e) {
      this.logger.error(`[Node ${state.host}] Shutdown error`);
      this.logger.error(e);

      return afterState || state;
    }
  }

  public async boot(state: NodeState, os: OS) {
    this.logger.log(`[Node ${state.host}] Boot requested with: ${os}`);
    this.bootTargets.set(state.host, os);

    /** Wait for boot */
    let afterState: NodeState;
    let waitPeriods = this.waitBootPeriods;
    do {
      await this.wake(state.mac);
      await wait(1000);
      afterState = await this.checkState(state);
      this.setState(afterState);
      this.logger.log(`[Node ${state.host}] Boot check (${waitPeriods})`);
    } while (waitPeriods-- > 0 && !afterState.alive);

    /** After boot set target to WINDOWS */
    this.bootTargets.set(state.host, OS.WINDOWS);
    if (waitPeriods >= 0)
      this.logger.log(`[Node ${state.host}] Booted with: ${afterState.os}`);
    else this.logger.error(`[Node ${state.host}] Boot timeout`);

    return afterState;
  }

  public async generateBootToken(options: BootTokenCreateDto): Promise<string> {
    return this.jwtService.sign(
      {
        host: options.host,
        os: options.os,
      },
      {
        expiresIn:
          DateTime.fromISO(options.expiresAt)
            .startOf('day')
            .diffNow()
            .as('seconds') + 's',
        secret: this.bootOptions.bootTokenSecret,
      },
    );
  }

  public async changePassword(
    state: NodeState,
    password: string,
  ): Promise<void> {
    const ssh = this.getSSHConnection(state);
    this.logger.log(`[Node ${state.host}] Opening SSH connection`);
    await ssh.connect();
    this.logger.log(`[Node ${state.host}] SSH connection opened`);

    if (state.os === OS.UBUNTU)
      await ssh.exec(
        `echo ${this.studentUsername}:${password} | sudo chpasswd`,
      );
    this.logger.log(`[Node ${state.host}] Student password changed`);
    await ssh.close();
  }

  private async wake(mac: string) {
    try {
      await firstValueFrom(
        this.httpService.post(`${this.bootOptions.wolAgentUrl}/wake`, {
          wake_token: this.jwtService.sign(
            { mac },
            { expiresIn: '1s', secret: this.bootOptions.wolAgentSecret },
          ),
        }),
      );
    } catch (e) {
      this.logger.error(e);
    }
  }

  private getUsername(state: NodeState) {
    return state.os === OS.UBUNTU ? state.username : state.usernameWindows;
  }

  private getSSHConnection(state: NodeState, username?: string) {
    return new SSH2Promise({
      host: state.host,
      username: username || this.getUsername(state),
      identity: this.configService.createPrivateKeyPath(),
      readyTimeout: 1000,
      reconnect: false,
      reconnectDelay: 0,
      reconnectTries: 0,
    } as unknown);
  }

  private handleTFTP(req, res) {
    req.on('error', (e) => {
      this.logger.error(e);
    });

    const address = req.stats.remoteAddress;
    const bootOS = this.bootTargets.get(address) || OS.WINDOWS;
    const bootTarget = this.configService.createBootOptions()[bootOS];

    this.logger.log(`[Node ${address}] GRUB boot with: ${bootOS}`);

    const message = `set default="${bootTarget}"`;
    res.setSize(message.length);
    res.end(message);
  }
}
