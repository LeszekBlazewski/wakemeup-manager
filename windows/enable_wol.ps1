# Downloads and loads REG file containing all necessary options for enablig WoL on windows 10 inisde 229 lab.

$reg_file_name = "enableWol.reg"
$reg_file_uri = "https://raw.githubusercontent.com/LeszekBlazewski/lab-229-cluster/master/wol/windows/${reg_file_name}"
Invoke-WebRequest -Uri $reg_file_uri -OutFile $reg_file_name
# Import the fil using reg programm
reg import $reg_file_name
