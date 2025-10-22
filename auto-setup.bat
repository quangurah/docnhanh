@echo off
echo 🚀 DocNhanh Auto Setup on AWS Server
echo =====================================
echo Server IP: 47.129.210.7
echo Domain: marketingservice.io
echo.

REM Check if PuTTY is installed
where puttygen >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ PuTTY not found. Please install PuTTY first.
    echo Download from: https://www.putty.org/
    pause
    exit /b 1
)

echo ✅ PuTTY found. Converting SSH key...

REM Convert PPK to OpenSSH format
puttygen "ai doc nhanh.ppk" -O private-openssh -o "ai-doc-nhanh-key"

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to convert SSH key
    pause
    exit /b 1
)

echo ✅ SSH key converted successfully

REM Create upload script
echo 📤 Creating upload script...
(
echo @echo off
echo echo 📤 Uploading DocNhanh to server...
echo scp -i "ai-doc-nhanh-key" -r "Frontend Redesign for DocNhanh\*" ubuntu@47.129.210.7:/home/ubuntu/docnhanh-frontend/
echo echo ✅ Upload completed!
echo pause
) > upload-files.bat

REM Create server setup script
echo 🔧 Creating server setup script...
(
echo #!/bin/bash
echo set -e
echo echo "🚀 Setting up DocNhanh on server..."
echo.
echo # Update system
echo sudo apt update ^&^& sudo apt upgrade -y
echo.
echo # Install Node.js 18
echo curl -fsSL https://deb.nodesource.com/setup_18.x ^| sudo -E bash -
echo sudo apt-get install -y nodejs
echo.
echo # Install PM2
echo sudo npm install -g pm2
echo.
echo # Install Nginx
echo sudo apt install -y nginx
echo.
echo # Install SSL tools
echo sudo apt install -y certbot python3-certbot-nginx
echo.
echo # Create app directory
echo sudo mkdir -p /var/www/docnhanh
echo sudo chown ubuntu:ubuntu /var/www/docnhanh
echo.
echo # Copy files
echo cp -r /home/ubuntu/docnhanh-frontend/* /var/www/docnhanh/
echo cd /var/www/docnhanh
echo.
echo # Install dependencies
echo npm install
echo.
echo # Build app
echo npm run build
echo.
echo # Create PM2 config
echo cat ^> ecosystem.config.js ^<< 'EOF'
echo module.exports = {
echo   apps: [{
echo     name: 'docnhanh-frontend',
echo     script: 'npm',
echo     args: 'run preview',
echo     cwd: '/var/www/docnhanh',
echo     user: 'ubuntu',
echo     instances: 1,
echo     autorestart: true,
echo     watch: false,
echo     max_memory_restart: '1G',
echo     env: {
echo       NODE_ENV: 'production',
echo       PORT: 3001,
echo       HOST: '0.0.0.0'
echo     }
echo   }]
echo };
echo 'EOF'
echo.
echo # Configure Nginx
echo sudo cat ^> /etc/nginx/sites-available/docnhanh ^<< 'EOF'
echo server {
echo     listen 80;
echo     server_name app.marketingservice.io;
echo     
echo     location / {
echo         proxy_pass http://localhost:3001;
echo         proxy_http_version 1.1;
echo         proxy_set_header Upgrade $http_upgrade;
echo         proxy_set_header Connection 'upgrade';
echo         proxy_set_header Host $host;
echo         proxy_set_header X-Real-IP $remote_addr;
echo         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
echo         proxy_set_header X-Forwarded-Proto $scheme;
echo         proxy_cache_bypass $http_upgrade;
echo         
echo         # Extended timeouts for VnExpress scraping
echo         proxy_connect_timeout 180s;
echo         proxy_send_timeout 180s;
echo         proxy_read_timeout 180s;
echo     }
echo }
echo 'EOF'
echo.
echo # Enable site
echo sudo ln -sf /etc/nginx/sites-available/docnhanh /etc/nginx/sites-enabled/
echo sudo rm -f /etc/nginx/sites-enabled/default
echo.
echo # Test and restart Nginx
echo sudo nginx -t
echo sudo systemctl restart nginx
echo sudo systemctl enable nginx
echo.
echo # Start app with PM2
echo pm2 start ecosystem.config.js
echo pm2 save
echo pm2 startup
echo.
echo # Configure firewall
echo sudo ufw allow 22/tcp
echo sudo ufw allow 80/tcp
echo sudo ufw allow 443/tcp
echo sudo ufw --force enable
echo.
echo # Get SSL certificate
echo sudo certbot --nginx -d app.marketingservice.io --non-interactive --agree-tos --email admin@marketingservice.io
echo.
echo echo "✅ DocNhanh setup completed!"
echo echo "🌐 App will be available at: https://app.marketingservice.io"
) > server-setup.sh

echo ✅ Scripts created successfully!
echo.
echo 📋 Next steps:
echo 1. Run: upload-files.bat
echo 2. SSH to server: ssh -i "ai-doc-nhanh-key" ubuntu@47.129.210.7
echo 3. Run: chmod +x server-setup.sh && sudo ./server-setup.sh
echo.
echo 🚀 Ready to deploy!
pause
