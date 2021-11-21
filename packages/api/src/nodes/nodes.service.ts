import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { ConfigService } from 'src/config/config.service';
import { NodeState, OS } from './interfaces/NodeState.interfaces';
import * as yaml from 'yaml';
import { Inventory } from './interfaces/Inventory.interface';

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
        const state: NodeState = this.getRandomState() || {
          host: host.ansible_host,
          mac: host.mac_address,
          alive: false,
          os: OS.WINDOWS,
          name: host.name,
          timestamp: new Date().getTime(),
          actionPending: false,
        };
        this.states.set(state.host, state);
      },
    );
  }

  private getRandomState() {
    return {
      host: '123.123.123.' + Math.floor(100 * Math.random()),
      mac: 'ab-cd-...',
      alive: Math.random() > 0.5,
      os: Math.random() > 0.5 ? OS.WINDOWS : OS.UBUNTU,
      name: 'Node ' + Math.floor(Math.random() * 10),
      timestamp: new Date().getTime(),
      actionPending: Math.random() > 0.5,
    };
  }

  public getNodeState(host: string) {
    if (!this.states.has(host)) throw new Error('Invalid node host.');
    return this.states.get(host);
  }

  public getStates() {
    return [...this.states.values()];
  }
}
