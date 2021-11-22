# Configure windows for wake on lan support + run SSH server by default

Simply execute the following command from an **elevated ADMIN** Powershell console **and on ADMIN windows account**:

```powershell
Invoke-Expression $(Invoke-WebRequest -UseBasicParsing -Uri https://raw.githubusercontent.com/LeszekBlazewski/lab-229-cluster/master/wol/windows/configure_win.ps1).Content
```
