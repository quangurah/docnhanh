@echo off
echo 🚀 Connecting to AI Doc Nhanh Server...
echo IP: 47.129.210.7
echo.

REM Convert PPK to OpenSSH format (if needed)
echo Converting PPK key to OpenSSH format...
puttygen "C:\Users\Admin\Downloads\ai doc nhanh.ppk" -O private-openssh -o "C:\Users\Admin\Downloads\ai-doc-nhanh-key"

echo.
echo Connecting to server...
ssh -i "C:\Users\Admin\Downloads\ai-doc-nhanh-key" ubuntu@47.129.210.7

pause
