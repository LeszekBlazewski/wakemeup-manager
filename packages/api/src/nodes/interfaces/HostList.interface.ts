export type HostIp = string;

interface Host {
  ip: HostIp;
  mac_address: string;
  name?: string;
  username_linux?: string;
  username_windows?: string;
}

export interface HostList {
  hosts: {
    [hostname: string]: Host;
  };
}
