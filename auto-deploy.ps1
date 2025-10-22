# DocNhanh Auto Deploy Script
Write-Host "🚀 DocNhanh Auto Setup on AWS Server" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Yellow
Write-Host "Server IP: 47.129.210.7" -ForegroundColor Cyan
Write-Host "Domain: marketingservice.io" -ForegroundColor Cyan
Write-Host ""

# Check if PuTTY is installed
try {
    $null = Get-Command puttygen -ErrorAction Stop
    Write-Host "✅ PuTTY found" -ForegroundColor Green
} catch {
    Write-Host "❌ PuTTY not found. Please install PuTTY first." -ForegroundColor Red
    Write-Host "Download from: https://www.putty.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Convert PPK to OpenSSH format
Write-Host "🔑 Converting SSH key..." -ForegroundColor Yellow
try {
    & puttygen "ai doc nhanh.ppk" -O private-openssh -o "ai-doc-nhanh-key"
    Write-Host "✅ SSH key converted successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to convert SSH key" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Create upload script
Write-Host "📤 Creating upload script..." -ForegroundColor Yellow
$uploadScript = @"
@echo off
echo 📤 Uploading DocNhanh to server...
scp -i "ai-doc-nhanh-key" -r "Frontend Redesign for DocNhanh\*" ubuntu@47.129.210.7:/home/ubuntu/docnhanh-frontend/
echo ✅ Upload completed!
echo.
echo Next: SSH to server and run setup
echo ssh -i "ai-doc-nhanh-key" ubuntu@47.129.210.7
pause
"@

$uploadScript | Out-File -FilePath "upload-files.bat" -Encoding ASCII

# Create server setup script
Write-Host "🔧 Creating server setup script..." -ForegroundColor Yellow
$serverScript = @"
#!/bin/bash
set -e
echo "🚀 Setting up DocNhanh on server..."

# Update system
echo "🔄 Updating system..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
echo "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install -y nginx

# Install SSL tools
echo "🔒 Installing SSL tools..."
sudo apt install -y certbot python3-certbot-nginx

# Create app directory
echo "📁 Creating app directory..."
sudo mkdir -p /var/www/docnhanh
sudo chown ubuntu:ubuntu /var/www/docnhanh

# Copy files
echo "📂 Copying files..."
cp -r /home/ubuntu/docnhanh-frontend/* /var/www/docnhanh/
cd /var/www/docnhanh

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build app
echo "🔨 Building app..."
npm run build

# Create PM2 config
echo "⚙️ Creating PM2 config..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'docnhanh-frontend',
    script: 'npm',
    args: 'run preview',
    cwd: '/var/www/docnhanh',
    user: 'ubuntu',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      HOST: '0.0.0.0',
      REACT_APP_API_URL: 'https://app.marketingservice.io',
      REACT_APP_BASE_URL: 'https://app.marketingservice.io'
    },
    error_file: '/var/log/pm2/docnhanh-error.log',
    out_file: '/var/log/pm2/docnhanh-out.log',
    log_file: '/var/log/pm2/docnhanh.log'
  }]
};
EOF

# Create PM2 log directory
sudo mkdir -p /var/log/pm2
sudo chown ubuntu:ubuntu /var/log/pm2

# Configure Nginx
echo "🌐 Configuring Nginx..."
sudo cat > /etc/nginx/sites-available/docnhanh << 'EOF'
server {
    listen 80;
    server_name app.marketingservice.io;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Extended timeouts for VnExpress scraping
        proxy_connect_timeout 180s;
        proxy_send_timeout 180s;
        proxy_read_timeout 180s;
    }
    
    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/docnhanh /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# Start app with PM2
echo "🚀 Starting app with PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Get SSL certificate
echo "🔒 Getting SSL certificate..."
sudo certbot --nginx -d app.marketingservice.io --non-interactive --agree-tos --email admin@marketingservice.io

echo "✅ DocNhanh setup completed!"
echo "🌐 App will be available at: https://app.marketingservice.io"
echo "📊 Monitor with: pm2 monit"
echo "📝 Logs: pm2 logs"
"@

$serverScript | Out-File -FilePath "server-setup.sh" -Encoding UTF8

Write-Host "✅ Scripts created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Run: .\upload-files.bat" -ForegroundColor Cyan
Write-Host "2. SSH to server: ssh -i `"ai-doc-nhanh-key`" ubuntu@47.129.210.7" -ForegroundColor Cyan
Write-Host "3. Run: chmod +x server-setup.sh && sudo ./server-setup.sh" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Ready to deploy!" -ForegroundColor Green
Read-Host "Press Enter to continue"
