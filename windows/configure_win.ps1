# 1. Downloads and loads REG file containing all necessary options for enabling WoL 
# 2. Configures windows to start SSH server
# 3. Allows ICMP traffic
# on windows 10 inside 229 lab.

$config_folder_uri="https://raw.githubusercontent.com/LeszekBlazewski/lab-229-cluster/master/wol/windows"

# WoL setup
$reg_file_name = "enableWol.reg"
Invoke-WebRequest -Uri "${config_folder_uri}/${reg_file_name}" -OutFile $reg_file_name
# Import the file using reg programm
reg import $reg_file_name
Write-Output "Registry entries for WoL and startup modified successfully."
Remove-Item $reg_file_name 

# SSH server setup
if ((Get-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0).State -eq "NotPresent") {
    try { Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0 }
    catch {"Adding openSSH server failed, but if the script continued everything should work properly"}
    
}
# Start and enable the sshd service
Start-Service sshd
Set-Service -Name sshd -StartupType 'Automatic'
Write-Output "SSH server installed successfully."
# Confirm the Firewall rule is configured. It should be created automatically by setup. Run the following to verify
if (!(Get-NetFirewallRule -Name "OpenSSH-Server-In-TCP" -ErrorAction SilentlyContinue | Select-Object Name, Enabled)) {
    Write-Output "Firewall Rule 'OpenSSH-Server-In-TCP' does not exist, creating it..."
    New-NetFirewallRule -Name 'OpenSSH-Server-In-TCP' -DisplayName 'OpenSSH Server (sshd)' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22
} else {
    Write-Output "Firewall rule 'OpenSSH-Server-In-TCP' has been created and exists."
}
# Put the default public key on the server
$ssh_key_file_name = "administrators_authorized_keys"
$ssh_key_file_location = "C:\ProgramData\ssh\${ssh_key_file_name}"
Invoke-WebRequest -Uri "${config_folder_uri}/${ssh_key_file_name}" -OutFile $ssh_key_file_location
# Appropriately ACL the authorized_keys file on your server
icacls.exe $ssh_key_file_location /inheritance:r /grant "Administrators:F" /grant "SYSTEM:F"
Write-Output "Public key lab229 copied and access for administrators granted successfully for public keys file."
# Disable password authentication and enable key auth
$sshd_config_file = "C:\ProgramData\ssh\sshd_config"
(Get-Content -path $sshd_config_file -Raw) -replace '#PubkeyAuthentication yes', 'PubkeyAuthentication yes'    | Set-Content -Path $sshd_config_file
(Get-Content -path $sshd_config_file -Raw) -replace '#PasswordAuthentication yes', 'PasswordAuthentication no' | Set-Content -Path $sshd_config_file
Write-Output "SSH password authentication disabled and key auth enabled successfully."
# Change default shell to powershell instead of cmd
New-ItemProperty -Path "HKLM:\SOFTWARE\OpenSSH" -Name DefaultShell -Value "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe" -PropertyType String -Force

# Allow RDP connections
Set-ItemProperty -Path 'HKLM:\System\CurrentControlSet\Control\Terminal Server'-name "fDenyTSConnections" -Value 0
Enable-NetFirewallRule -DisplayGroup "Remote Desktop"

# ICMP firewall rule
if (!(Get-NetFirewallRule -Name "ICMP Allow incoming V4 echo request" -ErrorAction SilentlyContinue | Select-Object Name, Enabled)) {
    Write-Output "Firewall Rule 'ICMP Allow incoming V4 echo request' does not exist, creating it..."
    New-NetFirewallRule -Name 'ICMP Allow incoming V4 echo request' -DisplayName 'ICMP Allow (ping)' -Enabled True -Direction Inbound -Protocol ICMPv4 -IcmpType 8 -Action Allow
} else {
    Write-Output "ICMP Allow incoming V4 echo request' has been created and exists."
}
