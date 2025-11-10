# PowerShell script to build RethinkBI in Docker Windows container
# Usage: .\build-windows-docker.ps1

Write-Host "Building RethinkBI in Docker Windows Container..." -ForegroundColor Green

# Check if Docker is running
$dockerRunning = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check if Windows containers are enabled
$dockerVersion = docker version --format '{{.Server.Os}}'
if ($dockerVersion -ne "windows") {
    Write-Host "Warning: Windows containers may not be enabled." -ForegroundColor Yellow
    Write-Host "Right-click Docker Desktop icon and select 'Switch to Windows containers'" -ForegroundColor Yellow
}

# Create output directories
Write-Host "Creating output directories..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path dist,out | Out-Null

# Build Docker image
Write-Host "Building Docker image..." -ForegroundColor Cyan
docker build -f Dockerfile.windows -t rethinkbi:windows .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Docker build failed." -ForegroundColor Red
    exit 1
}

# Run build in container
Write-Host "Running build in container..." -ForegroundColor Cyan
docker run --rm `
    -w C:\app `
    -v "${PWD}:C:\app" `
    -v "${PWD}\dist:C:\app\dist" `
    -v "${PWD}\out:C:\app\out" `
    rethinkbi:windows `
    cmd /S /C "npm install && npm run build && npm run dist"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nBuild complete! Check dist/ and out/ directories for artifacts." -ForegroundColor Green
    Write-Host "Installer location: out\*.exe" -ForegroundColor Green
} else {
    Write-Host "Error: Build failed in container." -ForegroundColor Red
    exit 1
}

