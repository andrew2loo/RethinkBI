# Script to help switch Docker to Linux containers
Write-Host "To build with Linux containers, please:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Right-click the Docker Desktop icon in the system tray" -ForegroundColor Cyan
Write-Host "2. Select 'Switch to Linux containers...'" -ForegroundColor Cyan
Write-Host "3. Wait for Docker to restart" -ForegroundColor Cyan
Write-Host "4. Then run: docker build -t rethinkbi:build ." -ForegroundColor Cyan
Write-Host ""
Write-Host "Alternatively, use GitHub Codespaces (no Docker needed):" -ForegroundColor Green
Write-Host "  - Push to GitHub" -ForegroundColor Green
Write-Host "  - Open in Codespaces" -ForegroundColor Green
Write-Host "  - Run: npm run build" -ForegroundColor Green


