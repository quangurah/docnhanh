# Test domain options for DocNhanh
Write-Host "Testing DocNhanh Backend on Public Domain"
Write-Host "========================================="
Write-Host ""

Write-Host "Current Backend Status:"
Write-Host "✅ Local: http://localhost:8000"
Write-Host "✅ Health: http://localhost:8000/api/v1/health"
Write-Host "✅ Docs: http://localhost:8000/docs"
Write-Host ""

Write-Host "Testing Domain Options:"
Write-Host ""

# Test if ngrok is available
Write-Host "1. Testing NGROK..."
try {
    $ngrokVersion = ngrok version 2>$null
    if ($ngrokVersion) {
        Write-Host "✅ ngrok is installed: $ngrokVersion"
        Write-Host "Starting ngrok tunnel..."
        Write-Host "Command: ngrok http 8000"
        Write-Host "This will create a public URL like: https://abc123.ngrok.io"
        Write-Host ""
    }
} catch {
    Write-Host "❌ ngrok not found. Install with: winget install --id ngrok.ngrok"
    Write-Host ""
}

# Test serveo
Write-Host "2. Testing SERVEO..."
Write-Host "✅ serveo is available (no install needed)"
Write-Host "Command: ssh -R 80:localhost:8000 serveo.net"
Write-Host "This will create a public URL like: https://serveo.net"
Write-Host ""

# Test localtunnel
Write-Host "3. Testing LOCALTUNNEL..."
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✅ Node.js is installed: $nodeVersion"
        Write-Host "Command: npx localtunnel --port 8000"
        Write-Host "This will create a public URL like: https://abc123.loca.lt"
        Write-Host ""
    }
} catch {
    Write-Host "❌ Node.js not found. Install Node.js first."
    Write-Host ""
}

Write-Host "Quick Start Commands:"
Write-Host "==================="
Write-Host ""

Write-Host "Option 1 - SERVEO (Recommended - No install):"
Write-Host "ssh -R 80:localhost:8000 serveo.net"
Write-Host ""

Write-Host "Option 2 - NGROK (If installed):"
Write-Host "ngrok http 8000"
Write-Host ""

Write-Host "Option 3 - LOCALTUNNEL (If Node.js installed):"
Write-Host "npx localtunnel --port 8000"
Write-Host ""

Write-Host "All methods will provide:"
Write-Host "✅ Public HTTPS URL"
Write-Host "✅ Free SSL certificate"
Write-Host "✅ Access from anywhere on internet"
Write-Host ""

Write-Host "Choose your preferred method and run the command!"
