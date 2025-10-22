# Start DocNhanh on public domain
Write-Host "Starting DocNhanh Backend on Public Domain"
Write-Host "==========================================="
Write-Host ""

Write-Host "Backend Status:"
Write-Host "✅ Running on: http://localhost:8000"
Write-Host "✅ Health: http://localhost:8000/api/v1/health"
Write-Host "✅ Docs: http://localhost:8000/docs"
Write-Host ""

Write-Host "Available Domain Options:"
Write-Host ""

Write-Host "1. SERVEO (No install needed):"
Write-Host "   Command: ssh -R 80:localhost:8000 serveo.net"
Write-Host "   Result: https://serveo.net"
Write-Host "   SSL: Auto"
Write-Host ""

Write-Host "2. LOCALTUNNEL (Node.js required):"
Write-Host "   Command: npx localtunnel --port 8000"
Write-Host "   Result: https://abc123.loca.lt"
Write-Host "   SSL: Auto"
Write-Host ""

Write-Host "3. NGROK (Install required):"
Write-Host "   Install: winget install --id ngrok.ngrok"
Write-Host "   Command: ngrok http 8000"
Write-Host "   Result: https://abc123.ngrok.io"
Write-Host "   SSL: Auto"
Write-Host ""

Write-Host "Quick Start - Choose one:"
Write-Host "========================"
Write-Host ""

Write-Host "Option A - SERVEO (Recommended):"
Write-Host "ssh -R 80:localhost:8000 serveo.net"
Write-Host ""

Write-Host "Option B - LOCALTUNNEL:"
Write-Host "npx localtunnel --port 8000"
Write-Host ""

Write-Host "Option C - NGROK:"
Write-Host "ngrok http 8000"
Write-Host ""

Write-Host "After running any command above:"
Write-Host "1. Copy the public URL from output"
Write-Host "2. Test: curl [PUBLIC_URL]/api/v1/health"
Write-Host "3. Share the URL with others"
Write-Host ""

Write-Host "All methods provide free SSL and public access!"
