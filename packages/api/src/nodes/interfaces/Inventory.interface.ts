export type AnsibleHost = string;

interface Host {
  ansible_host: AnsibleHost;
  mac_address: string;
  name: string;
  username: string;
}

export interface Inventory {
  kubernetes: {
    children: {
      master: {
        hosts: {
          [hostname: string]: Host;
        };
      };
      worker: {
        hosts: {
          [hostname: string]: Host;
        };
      };
    };
  };
}
