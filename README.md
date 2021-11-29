# Lab 229 - Cluster Manager

**All commands below are relative to `<repo>/manager` location.**

### Building Dockerfile
```sh
npx lerna-dockerize
```

### Running the stack
``` sh
docker-compose up -d --build
```

### GRUB Config
In `/etc/grub.d/40_custom` add lines (keep existing):
```sh
insmod net
insmod efinet
insmod tftp

net_bootp
source (tftp,{{master-ip}}:6969)/grub_config
```
* The filename `grub_config` doesn't really matter, any string would be ok.
* Port 6969 is configured via env variable of api container.

In `/etc/default/grub` change variables as follows:
```
GRUB_DEFAULT={{Windows boot option position in GRUB menu (probably 3, indexed from 0)}}
GRUB_TIMEOUT_STYLE=menu
GRUB_TIMEOUT={{GRUB menu timeout, let's set it to '1'}}
```

Don't forget to update GRUB:
```
sudo update-grub
```

In `docker-compose.yaml` you can set the env variables according to the port set in the GRUB config and OS's position in GRUB menu. Remember to adjust other port, related settings. Remember that TFTP is based on UDP.

```yml
  api:
    ...
    ports:
      - 6969:6969/udp
      ...
    environment:
    ...
    - TFTP_PORT=6969
    - GRUB_UBUNTU=0
    - GRUB_WINDOWS=3
    ...
```
