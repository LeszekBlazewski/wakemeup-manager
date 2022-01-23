# Configure Ubuntu for Wake on Lan

## Prerequisites

Remember that Wake on Lan must be supported on your network card, and you also **must** enable the required options inside your BIOS before setting up the OS.

## How to quickly enable Wake on Lan on Ubuntu?

In comparison to Windows a thousand Wake on Lan options, Linux as always is super simple. For Debian like systems, you simply do the following:

1. First, identify the NIC that is your Ethernet connection.

```bash
ip a

1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever
2: enp31s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
    link/ether X:X:X:X:X:X brd ff:ff:ff:ff:ff:ff
    inet X.X.X.X/X brd X.X.X.X scope global dynamic enp31s0
       valid_lft 12699sec preferred_lft 12699sec
```

For this case, the `enp31s0` is the NIC we are looking for.

2. Install ethtool if you don't have it already:

```bash
sudo apt-get update
sudo apt-get install ethtool
```

3. Then proceed with:

```bash
sudo ethtool enp31s0 # Your NIC name from 1 step

# Truncated output
Settings for enp31s0:
  Supports Wake-on: pumbg
  Wake-on: d  # here you can find different letters mostly g or d
```

d - disabled

g - enabled

If you see other letter than g, issue the below command:

```bash
sudo ethtool -s enp31s0 wol g # replace enp31s0 with yout NIC name
```

Then check again

```bash
sudo ethtool enp31s0 # Your NIC name from 1 step
```

And you should see `Wake-on: g`.

For some systems, it might be necessary to make this change after each boot, so google how to preserve it :). In our case for Ubuntu server 20.04 this was sufficient.
