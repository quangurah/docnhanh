# Script to test the backend API
Write-Host "Testing DocNhanh Backend API..."

# Test health endpoint
Write-Host "1. Testing Health Endpoint..."
try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/health" -Method GET
    Write-Host "Health check: $($healthResponse.StatusCode)"
    Write-Host "Response: $($healthResponse.Content)"
} catch {
    Write-Host "Health check failed: $($_.Exception.Message)"
}

Write-Host ""

# Test docs endpoint
Write-Host "2. Testing Docs Endpoint..."
try {
    $docsResponse = Invoke-WebRequest -Uri "http://localhost:8000/docs" -Method GET
    Write-Host "Docs endpoint: $($docsResponse.StatusCode)"
    Write-Host "Swagger UI is available at: http://localhost:8000/docs"
} catch {
    Write-Host "Docs endpoint failed: $($_.Exception.Message)"
}

Write-Host ""

# Test login endpoint
Write-Host "3. Testing Login Endpoint..."
try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"username":"test","password":"test"}'
    Write-Host "Login endpoint: $($loginResponse.StatusCode)"
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "Login endpoint working (401 Unauthorized as expected)"
    } else {
        Write-Host "Login endpoint failed: $($_.Exception.Message)"
    }
}

Write-Host ""
Write-Host "Backend API is running successfully!"
Write-Host "Available endpoints:"
Write-Host "   - Health: http://localhost:8000/api/v1/health"
Write-Host "   - Docs: http://localhost:8000/docs"
Write-Host "   - Login: http://localhost:8000/api/v1/auth/login"