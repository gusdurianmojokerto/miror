@echo off
echo ========================================
echo   Scrcpy Web Mirror Server
echo ========================================
echo.

if not exist node_modules (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting server...
echo.
node server.js

pause
