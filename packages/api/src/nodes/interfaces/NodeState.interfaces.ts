export enum OS {
  WINDOWS = 'windows',
  UBUNTU = 'ubuntu',
}

export interface NodeState {
  timestamp: number;
  mac: string;
  host: string;
  alive: boolean;
  os: OS;
  name: string;
  actionPending: boolean;
}
