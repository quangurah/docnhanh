# Script to setup free domain with SSL
Write-Host "Setting up DocNhanh with free domain and SSL"
Write-Host "=============================================`n"

# 1. Create directories
Write-Host "1. Creating directories..."
New-Item -ItemType Directory -Force -Path "traefik"
New-Item -ItemType Directory -Force -Path "certificates"
Write-Host "✅ Directories created`n"

# 2. Instructions for DuckDNS
Write-Host "2. DuckDNS Setup Instructions:"
Write-Host "   a) Go to https://www.duckdns.org/"
Write-Host "   b) Sign in with Google/GitHub"
Write-Host "   c) Create a subdomain: docnhanh"
Write-Host "   d) Copy your token"
Write-Host "   e) Update docker-compose-with-domain.yml with your token`n"

# 3. Update email in traefik config
Write-Host "3. Update email in traefik/traefik.yml:"
Write-Host "   Replace 'your-email@example.com' with your real email`n"

# 4. Start services
Write-Host "4. Starting services with domain..."
Write-Host "   Command: docker-compose -f docker-compose-with-domain.yml up -d"
Write-Host "   This will:"
Write-Host "   - Get SSL certificate from Let's Encrypt"
Write-Host "   - Update DuckDNS automatically"
Write-Host "   - Make your API available at: https://docnhanh.duckdns.org`n"

Write-Host "✅ Setup complete! Your API will be available at:"
Write-Host "   - https://docnhanh.duckdns.org/api/v1/health"
Write-Host "   - https://docnhanh.duckdns.org/docs"
Write-Host "   - Traefik Dashboard: http://localhost:8080"
