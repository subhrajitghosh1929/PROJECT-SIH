@echo off
title TransitMate Admin Portal (SIH 2026)
echo =========================================================
echo   🛡️ Opening TransitMate Admin Portal...
echo =========================================================

where node >nul 2>nul
if %errorlevel% equ 0 (
    start "" "http://localhost:5000/admin"
)

start "" "%~dp0transitmate-admin-offline.html"
exit
