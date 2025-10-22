@echo off
echo 📤 Uploading DocNhanh Frontend to server...
echo.

REM Convert PPK to OpenSSH format first
echo Converting PPK key...
puttygen "C:\Users\Admin\Downloads\ai doc nhanh.ppk" -O private-openssh -o "C:\Users\Admin\Downloads\ai-doc-nhanh-key"

echo.
echo Uploading files to server...

REM Upload project files
scp -i "C:\Users\Admin\Downloads\ai-doc-nhanh-key" -r "C:\Users\Admin\Downloads\Frontend Redesign for DocNhanh\*" ubuntu@47.129.210.7:/home/ubuntu/docnhanh-frontend/

echo.
echo ✅ Upload completed!
echo.
echo Next steps:
echo 1. SSH to server: ssh -i "C:\Users\Admin\Downloads\ai-doc-nhanh-key" ubuntu@47.129.210.7
echo 2. Run: cd /home/ubuntu/docnhanh-frontend
echo 3. Run: sudo ./deploy.sh

pause
