export enum OS {
  WINDOWS = 'windows',
  UBUNTU = 'ubuntu',
}

export interface NodeState {
  // Time
  timestamp: number;

  // Identity
  mac: string;
  host: string;
  fqdn: string;
  name?: string;

  // State
  alive: boolean;
  os: OS;
  actionPending: boolean;

  // Credentials
  username: string;
  usernameWindows: string;
}
