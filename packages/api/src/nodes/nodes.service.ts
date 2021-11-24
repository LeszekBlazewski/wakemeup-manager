import { Injectable, Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import { ConfigService } from 'src/config/config.service';
import { NodeState, OS } from './interfaces/NodeState.interfaces';
import * as yaml from 'yaml';
import { Inventory, AnsibleHost } from './interfaces/Inventory.interface';
import execa from 'execa';
import SSH2Promise from 'ssh2-promise';
import wait from 'wait';
import TFTP from 'tftp-server';
import wol from 'wol';

@Injectable()
export class NodesService {
  private states = new Map<AnsibleHost, NodeState>();
  private bootTargets = new Map<AnsibleHost, OS>();
  private logger = new Logger(NodesService.name);
  readonly waitPeriods = 60;

  constructor(private configService: ConfigService) {
    this.initStates();

    const tftp = TFTP.createServer();
    tftp.bind(configService.createTftpOptions());
    tftp.register(this.handleTFTP.bind(this));
  }

  private initStates() {
    this.states.clear();
    const p = this.configService.createInventoryPath();
    const inventory = readFileSync(p, { encoding: 'utf-8' });
    const parsed = yaml.parse(inventory) as Inventory;

    Object.values(parsed.kubernetes.children.worker.hosts || {}).forEach(
      (host) => {
        const state: NodeState = {
          host: host.ansible_host,
          mac: host.mac_address,
          alive: false,
          os: OS.WINDOWS,
          name: host.name,
          username: host.username,
          timestamp: new Date().getTime(),
          actionPending: false,
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
    return newState;
  }

  public async shutdown(state: NodeState) {
    const ssh = new SSH2Promise({
      host: state.host,
      username: state.username,
      identity: this.configService.createPrivateKeyPath(),
    } as unknown);
    try {
      await ssh.connect();
      if (state.os === OS.UBUNTU) await ssh.exec('sudo', ['shutdown', 'now']);
      else await ssh.exec('shutdown', ['-s', '-t', '0']);
      this.logger.log(`[Node ${state.host}] Shutdown requested`);
      ssh.close();

      /** Wait for shutdown */
      let afterState: NodeState;
      let waitPeriods = this.waitPeriods;
      do {
        await wait(1000);
        afterState = await this.checkState(state);
        this.setState(afterState);
        this.logger.log(`[Node ${state.host}] Shutdown check (${waitPeriods})`);
      } while (waitPeriods-- > 0 && afterState.alive);

      if (waitPeriods >= 0) this.logger.log(`[Node ${state.host}] Shutdown`);
      else this.logger.log(`[Node ${state.host}] Shutdown timeout`);

      return afterState;
    } catch (e) {
      return state;
    }
  }

  public async boot(state: NodeState, os: OS) {
    this.logger.log(`[Node ${state.host}] Boot requested with: ${os}`);
    this.bootTargets.set(state.host, os);

    /** Wait for boot */
    let afterState: NodeState;
    let waitPeriods = this.waitPeriods;
    do {
      wol.wake(state.mac);
      await wait(1000);
      afterState = await this.checkState(state);
      this.setState(afterState);
      this.logger.log(`[Node ${state.host}] Boot check (${waitPeriods})`);
    } while (waitPeriods-- > 0 && !afterState.alive);

    /** After boot set target to WINDOWS */
    this.bootTargets.set(state.host, OS.WINDOWS);
    if (waitPeriods >= 0)
      this.logger.log(`[Node ${state.host}] Booted with: ${afterState.os}`);
    else this.logger.log(`[Node ${state.host}] Boot timeout`);

    return afterState;
  }

  private handleTFTP(req, res) {
    const address = /(\d+\.\d+\.\d+\.\d+)$/gm.exec(req.address)[1];
    const bootOS = this.bootTargets.get(address) || OS.WINDOWS;
    const bootTarget = this.configService.createBootOptions()[bootOS];
    this.logger.log(`[Node ${address}] GRUB boot with: ${bootOS}`);
    res(Buffer.from(`set GRUB_DEFAULT="${bootTarget}"`), req);
  }
}
