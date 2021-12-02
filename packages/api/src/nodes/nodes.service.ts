import { Injectable, Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import { ConfigService } from 'src/config/config.service';
import { NodeState, OS } from './interfaces/NodeState.interfaces';
import * as yaml from 'yaml';
import { Inventory, AnsibleHost } from './interfaces/Inventory.interface';
import execa from 'execa';
import SSH2Promise from 'ssh2-promise';
import wait from 'wait';
import TFTP from 'tftp';
import { HttpService } from '@nestjs/axios';
import { BootOptions } from 'src/config/interfaces/boot-options.interface';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NodesService {
  private states = new Map<AnsibleHost, NodeState>();
  private bootTargets = new Map<AnsibleHost, OS>();
  private logger = new Logger(NodesService.name);
  readonly waitShutdownPeriods = 60;
  readonly waitBootPeriods = 30;
  readonly bootOptions: BootOptions;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private jwtService: JwtService,
  ) {
    this.initStates();
    this.bootOptions = configService.createBootOptions();

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
    try {
      const { stdout } = await execa('ping', ['-c1', state.host, '-w', '1']);
      const ttlRegexp = /\sttl=(\d+)\s/gm;
      const ttl = +ttlRegexp.exec(stdout)[1];
      newState.os = ttl <= 64 ? OS.UBUNTU : OS.WINDOWS;
      newState.alive = true;
    } catch (e) {
      newState.alive = false;
    }
    this.logger.log(
      `[Node ${state.host}] State check {alive: ${newState.alive}, os: ${newState.os}, actionPending: ${newState.actionPending}}`,
    );
    return newState;
  }

  public async shutdown(state: NodeState) {
    const ssh = new SSH2Promise({
      host: state.host,
      username: this.getUsername(state),
      identity: this.configService.createPrivateKeyPath(),
    } as unknown);

    let afterState: NodeState;
    try {
      this.logger.log(`[Node ${state.host}] Opening SSH connection`);
      await ssh.connect();
      this.logger.log(`[Node ${state.host}] SSH connection opened`);

      if (state.os === OS.UBUNTU) await ssh.exec('sudo', ['shutdown', 'now']);
      else await ssh.exec('shutdown', ['-s', '-t', '0']);
      this.logger.log(`[Node ${state.host}] Shutdown requested`);
      ssh.close();

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

  private async wake(mac: string) {
    await firstValueFrom(
      this.httpService.post(`${this.bootOptions.wolAgentUrl}/wake`, {
        wake_token: this.jwtService.sign(
          { mac },
          { expiresIn: '1s', secret: this.bootOptions.wolAgentSecret },
        ),
      }),
    );
  }

  private getUsername(state: NodeState) {
    return state.os === OS.UBUNTU ? state.username : state.usernameWindows;
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
