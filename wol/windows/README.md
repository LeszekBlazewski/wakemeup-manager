# Configure windows for wake on Lan support + run SSH server + RDP

## Prerequisites

Remember that Wake on Lan must be supported on your network card, and you also **must** enable the required options inside your BIOS before setting up the OS.

## How to quickly enable Wake on Lan on Windows?

Because there are many settings for different network cards. Here, we include only sample automated instructions for enabling Wake on Lan on `Ethernet controller: Intel Corporation I211 Gigabit Network Connection (rev 03)` network card.

In order to enable Wake on Lan you need to either click the settings on the UI or modify the correct registry entries. We recommend the second approach when you manage a lot of machines.

In the [enableWoL.reg](./enableWol.reg) file you can find sample registry entries that were sufficient to enable Wake on Lan on a Windows machine. You can also google how to do it, but in our case the `EnablePME` option wasn't available from the UI and could only be accessed from a 3rd party intel network manager app for the network card. You can copy over that file and simply run it and the entries will be modified correctly if the keys match.

## How to enable SSH on Windows?

Windows has a built-in SSH server. It can be either enabled with GUI or scripted in PowerShell. In [configure_win.ps1](./configure_win.ps1) script you can find all the commands for enabling, starting and configuring SSH server correctly. By default, it is set up for password auth, so the commands modify it only for key auth and add the correct key to the authorized list.

The [administrators_authorized_keys](./administrators_authorized_keys) file needs to contain the public ssh key which will be allowed to access remotely the Windows machine.

Also, we modify the default shell from cmd to PowerShell so the SSH connection experience will be nicer.

## How to enable RDP on Windows?

SSH connections works great, but mostly if working with Windows remotely, RDP will be used, therefore you can find the commands for enabling RDP inside the [configure_win.ps1](./configure_win.ps1) script.

## How to automate all of this and run it?

Modify the [administrators_authorized_keys](./administrators_authorized_keys) file and the [configure_win.ps1](./configure_win.ps1) script, copy all the files to target machine and run the script.

**Remember to execute the script from an _elevated ADMIN_ PowerShell console and on _ADMIN windows account_**.
