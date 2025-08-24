@echo off
echo.
echo ========================================
echo   Levity Loyalty - Local Test Server
echo ========================================
echo.

REM Check if dist folder exists
if not exist "dist" (
    echo ❌ Error: dist folder not found!
    echo Please run 'npm run build' first.
    echo.
    pause
    exit /b 1
)

echo 📁 Found dist folder
echo 🚀 Starting local HTTP server...
echo.
echo 🌐 The application will be available at:
echo    http://localhost:8080
echo.
echo ⏹️  Press Ctrl+C to stop the server
echo.

REM Try Python first
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo 🐍 Using Python HTTP server
    cd dist
    python -m http.server 8080
) else (
    echo ❌ Python not found, trying Node.js...
    
    REM Try Node.js http-server
    npx http-server --version >nul 2>&1
    if %errorlevel% == 0 (
        echo 📦 Using Node.js http-server
        npx http-server dist -p 8080 -c-1 --cors
    ) else (
        echo ❌ No suitable server found!
        echo.
        echo Please install one of the following:
        echo   1. Python: https://python.org
        echo   2. Node.js: npm install -g http-server
        echo.
        pause
        exit /b 1
    )
)

pause
