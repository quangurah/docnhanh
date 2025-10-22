# Script to start ngrok and get the public URL
Write-Host "Starting ngrok..."
Start-Process -FilePath "ngrok" -ArgumentList "http", "8000" -WindowStyle Hidden

# Wait for ngrok to start
Start-Sleep 10

# Try to get the tunnel information
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4040/api/tunnels" -Method GET
    $tunnels = $response.Content | ConvertFrom-Json
    
    if ($tunnels.tunnels.Count -gt 0) {
        $publicUrl = $tunnels.tunnels[0].public_url
        Write-Host "Ngrok tunnel created successfully!"
        Write-Host "Public URL: $publicUrl"
        Write-Host "API Endpoints:"
        Write-Host "   - Health: $publicUrl/api/v1/health"
        Write-Host "   - Docs: $publicUrl/docs"
        Write-Host "   - Login: $publicUrl/api/v1/auth/login"
        
        # Save URL to file
        $publicUrl | Out-File -FilePath "ngrok-url.txt" -Encoding UTF8
        Write-Host "URL saved to ngrok-url.txt"
    } else {
        Write-Host "No tunnels found"
    }
} catch {
    Write-Host "Error getting tunnel information: $($_.Exception.Message)"
    Write-Host "Please check if ngrok is running manually"
}

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")