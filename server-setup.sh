#!/bin/bash

# DocNhanh Server Setup Script
# Run this on the server: 47.129.210.7

set -e

echo "🚀 Setting up DocNhanh on server 47.129.210.7..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
APP_NAME="docnhanh-frontend"
APP_DIR="/var/www/docnhanh"
DOMAIN="marketingservice.io"
APP_SUBDOMAIN="app.marketingservice.io"

echo -e "${YELLOW}📋 Server Configuration:${NC}"
echo "Server IP: 47.129.210.7"
echo "Domain: $DOMAIN"
echo "App Subdomain: $APP_SUBDOMAIN"
echo "App Directory: $APP_DIR"

# Update system
echo -e "${YELLOW}🔄 Updating system...${NC}"
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
echo -e "${YELLOW}📦 Installing Node.js 18...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
echo -e "${YELLOW}📦 Installing PM2...${NC}"
sudo npm install -g pm2

# Install Nginx
echo -e "${YELLOW}📦 Installing Nginx...${NC}"
sudo apt install -y nginx

# Install Certbot for SSL
echo -e "${YELLOW}🔒 Installing SSL tools...${NC}"
sudo apt install -y certbot python3-certbot-nginx

# Create application directory
echo -e "${YELLOW}📁 Creating application directory...${NC}"
sudo mkdir -p $APP_DIR
sudo chown ubuntu:ubuntu $APP_DIR

# Copy application files
echo -e "${YELLOW}📂 Setting up application...${NC}"
cd /home/ubuntu/docnhanh-frontend
cp -r . $APP_DIR/
sudo chown -R ubuntu:ubuntu $APP_DIR

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
cd $APP_DIR
npm install

# Build application
echo -e "${YELLOW}🔨 Building application...${NC}"
npm run build

# Create PM2 ecosystem file
echo -e "${YELLOW}⚙️ Creating PM2 configuration...${NC}"
cat > $APP_DIR/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'npm',
    args: 'run preview',
    cwd: '$APP_DIR',
    user: 'ubuntu',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      HOST: '0.0.0.0',
      REACT_APP_API_URL: 'https://$APP_SUBDOMAIN',
      REACT_APP_BASE_URL: 'https://$APP_SUBDOMAIN'
    },
    error_file: '/var/log/pm2/$APP_NAME-error.log',
    out_file: '/var/log/pm2/$APP_NAME-out.log',
    log_file: '/var/log/pm2/$APP_NAME.log'
  }]
};
EOF

# Create PM2 log directory
sudo mkdir -p /var/log/pm2
sudo chown ubuntu:ubuntu /var/log/pm2

# Configure Nginx for DocNhanh
echo -e "${YELLOW}🌐 Configuring Nginx...${NC}"
sudo cat > /etc/nginx/sites-available/$APP_NAME << EOF
server {
    listen 80;
    server_name $APP_SUBDOMAIN;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
    
    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    
    # Main application
    location / {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
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
sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Start services
echo -e "${YELLOW}🚀 Starting services...${NC}"
sudo systemctl restart nginx
sudo systemctl enable nginx

# Start application with PM2
pm2 start $APP_DIR/ecosystem.config.js
pm2 save
pm2 startup

# Configure firewall
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Get SSL certificate
echo -e "${YELLOW}🔒 Getting SSL certificate...${NC}"
sudo certbot --nginx -d $APP_SUBDOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

echo -e "${GREEN}✅ DocNhanh setup completed!${NC}"
echo -e "${GREEN}🌐 Your application will be available at: https://$APP_SUBDOMAIN${NC}"
echo -e "${GREEN}📊 Monitor with: pm2 monit${NC}"
echo -e "${GREEN}📝 Logs: pm2 logs${NC}"
echo -e "${GREEN}🔄 Restart: pm2 restart $APP_NAME${NC}"
