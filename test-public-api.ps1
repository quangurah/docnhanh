# Script to test public API access
Write-Host "Testing DocNhanh Backend API - Public Access"
Write-Host "=============================================="

# Get local IP address
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*" -or $_.IPAddress -like "172.*"} | Select-Object -First 1).IPAddress

Write-Host "Local IP Address: $ipAddress"
Write-Host ""

# Test localhost
Write-Host "1. Testing localhost access..."
try {
    $localhostResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/health" -Method GET
    Write-Host "✅ Localhost: $($localhostResponse.StatusCode)"
} catch {
    Write-Host "❌ Localhost failed: $($_.Exception.Message)"
}

# Test IP address
Write-Host "2. Testing IP address access..."
try {
    $ipResponse = Invoke-WebRequest -Uri "http://$ipAddress:8000/api/v1/health" -Method GET
    Write-Host "✅ IP Address: $($ipResponse.StatusCode)"
} catch {
    Write-Host "❌ IP Address failed: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "🌐 Public API Endpoints:"
Write-Host "   - Health: http://$ipAddress:8000/api/v1/health"
Write-Host "   - Docs: http://$ipAddress:8000/docs"
Write-Host "   - Login: http://$ipAddress:8000/api/v1/auth/login"
Write-Host ""
Write-Host "📋 For external access:"
Write-Host "   - Other devices on same network: http://$ipAddress:8000"
Write-Host "   - Internet access: Configure port forwarding on router"
Write-Host "   - Or use tunneling services like ngrok, localtunnel, etc."
Write-Host ""
Write-Host "🔧 Docker Status:"
docker-compose ps
