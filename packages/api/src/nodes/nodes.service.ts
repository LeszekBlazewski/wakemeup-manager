import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { ConfigService } from 'src/config/config.service';
import { NodeState, OS } from './interfaces/NodeState.interfaces';
import * as yaml from 'yaml';
import { Inventory } from './interfaces/Inventory.interface';
import execa from 'execa';
import SSH2Promise from 'ssh2-promise';
import wait from 'wait';
@Injectable()
export class NodesService {
  /** Map<ansible_host, NodeState> */
  private states = new Map<string, NodeState>();

  constructor(private configService: ConfigService) {
    this.initStates();
  }

  private initStates() {
    this.states.clear();
    const p = this.configService.getInventoryPath();
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
      },
    );
  }

  public getState(host: string) {
    if (!this.states.has(host)) throw new Error('Invalid node host.');
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
      identity: this.configService.getPrivateKeyPath(),
    } as unknown);
    await ssh.connect();
    try {
      if (state.os === OS.UBUNTU) await ssh.exec('sudo', ['shutdown', 'now']);
      else await ssh.exec('shutdown', ['-s', '-t', '0']);
    } catch (e) {
      /** */
    } finally {
      ssh.close();
    }

    /** Wait for shutdown */
    let afterState: NodeState;
    do {
      await wait(1000);
      afterState = await this.checkState(state);
      this.setState(afterState);
    } while (afterState.alive);
  }
}
