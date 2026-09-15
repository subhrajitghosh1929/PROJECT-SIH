@echo off
title TransitMate — Full Stack Launch (SIH 2026)
color 0B

echo =================================================================
echo   🚆 TransitMate — Smart Urban Transit Companion (SIH 2026)
echo =================================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Node.js is not detected on this computer.
    echo [*] Opening 100%% Standalone Offline App instead...
    echo.
    start "" "%~dp0transitmate-singlefile.html"
    pause
    exit /b
)

echo [*] Node.js detected. Preparing full-stack environment...
echo.

if not exist "%~dp0node_modules" (
    echo [*] Installing root dependencies (first-time setup, please wait)...
    call npm install
)

if not exist "%~dp0backend\node_modules" (
    echo [*] Installing backend dependencies...
    cd "%~dp0backend"
    call npm install
    cd "%~dp0"
)

echo.
echo =================================================================
echo   🚀 Starting Backend Server (Port 5000) & Frontend (Port 5173)...
echo   🛡️ Admin Portal: http://localhost:5000/admin
echo =================================================================
echo.

start "" "http://localhost:5000/admin"
timeout /t 2 >nul
start "" "http://localhost:5173"

call npm run dev:all
pause
