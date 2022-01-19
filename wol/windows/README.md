# Configure windows for wake on lan support + run SSH server + RDP by default

The administrators_authorized_keys needs to contain the public ssh key which will be allowed to access remotely the windows machine.

Simply execute the following command from an **elevated ADMIN** Powershell console **and on ADMIN windows account**:

```powershell
Invoke-Expression $(Invoke-WebRequest -UseBasicParsing -Uri https://raw.githubusercontent.com/LeszekBlazewski/wakemeup-manager/master/wol/windows/configure_win.ps1).Content
```
