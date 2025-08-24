# Levity Loyalty - Local Test Server (PowerShell)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Levity Loyalty - Local Test Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if dist folder exists
if (-not (Test-Path "dist")) {
    Write-Host "❌ Error: dist folder not found!" -ForegroundColor Red
    Write-Host "Please run 'npm run build' first." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "📁 Found dist folder" -ForegroundColor Green
Write-Host "🚀 Starting local HTTP server..." -ForegroundColor Blue
Write-Host ""
Write-Host "🌐 The application will be available at:" -ForegroundColor Yellow
Write-Host "   http://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "⏹️  Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Try Python first
try {
    $pythonVersion = python --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "🐍 Using Python HTTP server" -ForegroundColor Green
        Set-Location dist
        
        # Start Python server and open browser
        Start-Process "http://localhost:8080"
        python -m http.server 8080
    }
} catch {
    Write-Host "❌ Python not found, trying Node.js..." -ForegroundColor Yellow
    
    # Try Node.js http-server
    try {
        $httpServerVersion = npx http-server --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "📦 Using Node.js http-server" -ForegroundColor Green
            
            # Start Node.js server and open browser
            Start-Process "http://localhost:8080"
            npx http-server dist -p 8080 -c-1 --cors
        }
    } catch {
        Write-Host "❌ No suitable server found!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please install one of the following:" -ForegroundColor Yellow
        Write-Host "  1. Python: https://python.org" -ForegroundColor White
        Write-Host "  2. Node.js: npm install -g http-server" -ForegroundColor White
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Read-Host "Press Enter to exit"
