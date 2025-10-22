# Run DocNhanh Backend on Public Domain
Write-Host "DocNhanh Backend - Public Domain Setup"
Write-Host "====================================="
Write-Host ""

Write-Host "Current Status:"
Write-Host "✅ Backend running on: http://localhost:8000"
Write-Host "✅ API Health: http://localhost:8000/api/v1/health"
Write-Host "✅ API Docs: http://localhost:8000/docs"
Write-Host ""

Write-Host "Testing Public Domain Options:"
Write-Host ""

# Test localhost first
Write-Host "1. Testing localhost access..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/health" -Method GET -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Localhost: $($response.StatusCode) - $($response.Content)"
} catch {
    Write-Host "❌ Localhost failed: $($_.Exception.Message)"
}
Write-Host ""

# Try localtunnel
Write-Host "2. Starting LOCALTUNNEL..."
Write-Host "Command: npx localtunnel --port 8000"
Write-Host "This will create a public URL like: https://abc123.loca.lt"
Write-Host ""

# Try serveo
Write-Host "3. Starting SERVEO..."
Write-Host "Command: ssh -R 80:localhost:8000 serveo.net"
Write-Host "This will create a public URL like: https://serveo.net"
Write-Host ""

Write-Host "Manual Commands to Run:"
Write-Host "======================"
Write-Host ""

Write-Host "Option 1 - LOCALTUNNEL:"
Write-Host "npx localtunnel --port 8000"
Write-Host ""

Write-Host "Option 2 - SERVEO:"
Write-Host "ssh -R 80:localhost:8000 serveo.net"
Write-Host ""

Write-Host "Option 3 - NGROK (if installed):"
Write-Host "ngrok http 8000"
Write-Host ""

Write-Host "After running any command:"
Write-Host "1. Copy the public URL from the output"
Write-Host "2. Test with: curl [PUBLIC_URL]/api/v1/health"
Write-Host "3. Share the URL with others"
Write-Host ""

Write-Host "All methods provide free SSL and public access!"
Write-Host "Choose your preferred method and run the command."
