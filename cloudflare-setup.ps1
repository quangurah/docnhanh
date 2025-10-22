# Script to setup Cloudflare Tunnel (Easiest method)
Write-Host "Setting up DocNhanh with Cloudflare Tunnel"
Write-Host "==========================================`n"

Write-Host "1. Install cloudflared:"
Write-Host "   Download from: https://github.com/cloudflare/cloudflared/releases"
Write-Host "   Or use: winget install --id Cloudflare.cloudflared`n"

Write-Host "2. Login to Cloudflare:"
Write-Host "   cloudflared tunnel login`n"

Write-Host "3. Create tunnel:"
Write-Host "   cloudflared tunnel create docnhanh`n"

Write-Host "4. Configure tunnel:"
Write-Host "   cloudflared tunnel route dns docnhanh your-domain.com`n"

Write-Host "5. Run tunnel:"
Write-Host "   cloudflared tunnel run docnhanh`n"

Write-Host "✅ Benefits:"
Write-Host "   - Free SSL certificate"
Write-Host "   - No port forwarding needed"
Write-Host "   - Works behind NAT/firewall"
Write-Host "   - Global CDN"
Write-Host "   - DDoS protection"
