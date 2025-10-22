# Demo domain options for DocNhanh
Write-Host "DocNhanh Domain Demo"
Write-Host "==================="
Write-Host ""

Write-Host "Current API Status:"
Write-Host "✅ Backend: http://localhost:8000"
Write-Host "✅ Health: http://localhost:8000/api/v1/health"
Write-Host "✅ Docs: http://localhost:8000/docs"
Write-Host ""

Write-Host "Free Domain Options with SSL:"
Write-Host ""

Write-Host "1. DUCKDNS (Permanent domain):"
Write-Host "   🌐 https://docnhanh.duckdns.org"
Write-Host "   🔒 SSL: Let's Encrypt (Auto)"
Write-Host "   📝 Setup: https://www.duckdns.org/"
Write-Host "   ⏱️  Time: 5 minutes"
Write-Host ""

Write-Host "2. NGROK (Temporary domain):"
Write-Host "   🌐 https://abc123.ngrok.io"
Write-Host "   🔒 SSL: Auto"
Write-Host "   📝 Setup: ngrok http 8000"
Write-Host "   ⏱️  Time: 1 minute"
Write-Host ""

Write-Host "3. SERVEO (No install):"
Write-Host "   🌐 https://serveo.net"
Write-Host "   🔒 SSL: Auto"
Write-Host "   📝 Setup: ssh -R 80:localhost:8000 serveo.net"
Write-Host "   ⏱️  Time: 30 seconds"
Write-Host ""

Write-Host "4. CLOUDFLARE TUNNEL:"
Write-Host "   🌐 Custom domain"
Write-Host "   🔒 SSL: Auto + Global CDN"
Write-Host "   📝 Setup: cloudflared tunnel create docnhanh"
Write-Host "   ⏱️  Time: 10 minutes"
Write-Host ""

Write-Host "Quick Start Commands:"
Write-Host "===================="
Write-Host ""

Write-Host "Test current API:"
Write-Host "curl http://localhost:8000/api/v1/health"
Write-Host ""

Write-Host "Start ngrok (if installed):"
Write-Host "ngrok http 8000"
Write-Host ""

Write-Host "Start serveo:"
Write-Host "ssh -R 80:localhost:8000 serveo.net"
Write-Host ""

Write-Host "All methods provide:"
Write-Host "✅ Free SSL certificates"
Write-Host "✅ HTTPS encryption"
Write-Host "✅ Public access from internet"
Write-Host "✅ No port forwarding needed"
Write-Host ""

Write-Host "Choose your preferred method and follow the steps!"
