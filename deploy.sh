#!/bin/bash

# AWS Deployment Script for DocNhanh Frontend
# Usage: ./deploy.sh

set -e

echo "🚀 Starting AWS deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="docnhanh-frontend"
APP_DIR="/var/www/docnhanh"
SERVICE_USER="docnhanh"
NGINX_SITES="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"

echo -e "${YELLOW}📋 Deployment Configuration:${NC}"
echo "App Name: $APP_NAME"
echo "App Directory: $APP_DIR"
echo "Service User: $SERVICE_USER"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Please run as root or with sudo${NC}"
    exit 1
fi

# Update system
echo -e "${YELLOW}🔄 Updating system packages...${NC}"
apt update && apt upgrade -y

# Install Node.js 18
echo -e "${YELLOW}📦 Installing Node.js 18...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2 globally
echo -e "${YELLOW}📦 Installing PM2...${NC}"
npm install -g pm2

# Install Nginx
echo -e "${YELLOW}📦 Installing Nginx...${NC}"
apt install -y nginx

# Create application user
echo -e "${YELLOW}👤 Creating application user...${NC}"
if ! id "$SERVICE_USER" &>/dev/null; then
    useradd -r -s /bin/bash -d $APP_DIR $SERVICE_USER
fi

# Create application directory
echo -e "${YELLOW}📁 Creating application directory...${NC}"
mkdir -p $APP_DIR
chown $SERVICE_USER:$SERVICE_USER $APP_DIR

# Copy application files
echo -e "${YELLOW}📂 Copying application files...${NC}"
cp -r . $APP_DIR/
chown -R $SERVICE_USER:$SERVICE_USER $APP_DIR

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
cd $APP_DIR
sudo -u $SERVICE_USER npm install

# Build application
echo -e "${YELLOW}🔨 Building application...${NC}"
sudo -u $SERVICE_USER npm run build

# Create PM2 ecosystem file
echo -e "${YELLOW}⚙️ Creating PM2 configuration...${NC}"
cat > $APP_DIR/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'npm',
    args: 'run preview',
    cwd: '$APP_DIR',
    user: '$SERVICE_USER',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      HOST: '0.0.0.0'
    },
    error_file: '/var/log/pm2/$APP_NAME-error.log',
    out_file: '/var/log/pm2/$APP_NAME-out.log',
    log_file: '/var/log/pm2/$APP_NAME.log'
  }]
};
EOF

# Create PM2 log directory
mkdir -p /var/log/pm2
chown $SERVICE_USER:$SERVICE_USER /var/log/pm2

# Configure Nginx
echo -e "${YELLOW}🌐 Configuring Nginx...${NC}"
cat > $NGINX_SITES/$APP_NAME << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
    
    # Static files
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
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
ln -sf $NGINX_SITES/$APP_NAME $NGINX_ENABLED/
rm -f $NGINX_ENABLED/default

# Test Nginx configuration
nginx -t

# Start services
echo -e "${YELLOW}🚀 Starting services...${NC}"
systemctl restart nginx
systemctl enable nginx

# Start application with PM2
sudo -u $SERVICE_USER pm2 start $APP_DIR/ecosystem.config.js
sudo -u $SERVICE_USER pm2 save
sudo -u $SERVICE_USER pm2 startup

# Configure firewall
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Install SSL certificate (optional)
echo -e "${YELLOW}🔒 SSL Certificate Setup (Optional):${NC}"
echo "To install SSL certificate, run:"
echo "sudo apt install certbot python3-certbot-nginx"
echo "sudo certbot --nginx -d your-domain.com"

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Your application is running at: http://your-domain.com${NC}"
echo -e "${GREEN}📊 Monitor with: sudo -u $SERVICE_USER pm2 monit${NC}"
echo -e "${GREEN}📝 Logs: sudo -u $SERVICE_USER pm2 logs${NC}"
