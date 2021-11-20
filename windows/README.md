# Configure windows for wake on lan support

Simply execute the following command from an **elevated ADMIN** Powershell console:

```powershell
Invoke-Expression $(Invoke-WebRequest -UseBasicParsing -Uri https://raw.githubusercontent.com/LeszekBlazewski/lab-229-cluster/master/wol/windows/enable_wol.ps1).Content
```
