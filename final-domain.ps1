# Final domain setup for DocNhanh
Write-Host "DocNhanh - Free Domain with SSL"
Write-Host "==============================="
Write-Host ""

Write-Host "Current Status:"
Write-Host "Backend: http://localhost:8000"
Write-Host "Health: http://localhost:8000/api/v1/health"
Write-Host "Docs: http://localhost:8000/docs"
Write-Host ""

Write-Host "Free Domain Options:"
Write-Host ""

Write-Host "1. DUCKDNS (Recommended):"
Write-Host "   Domain: https://docnhanh.duckdns.org"
Write-Host "   SSL: Auto from Let's Encrypt"
Write-Host "   Setup: https://www.duckdns.org/"
Write-Host ""

Write-Host "2. NGROK (Quick):"
Write-Host "   Domain: https://random.ngrok.io"
Write-Host "   SSL: Auto"
Write-Host "   Setup: ngrok http 8000"
Write-Host ""

Write-Host "3. SERVEO (No install):"
Write-Host "   Domain: https://serveo.net"
Write-Host "   SSL: Auto"
Write-Host "   Setup: ssh -R 80:localhost:8000 serveo.net"
Write-Host ""

Write-Host "4. CLOUDFLARE TUNNEL:"
Write-Host "   Domain: Custom domain"
Write-Host "   SSL: Auto + Global CDN"
Write-Host "   Setup: cloudflared tunnel create docnhanh"
Write-Host ""

Write-Host "Quick Test:"
Write-Host "curl http://localhost:8000/api/v1/health"
Write-Host ""

Write-Host "All methods provide free SSL certificates!"
Write-Host "Choose your preferred method and follow the steps."
