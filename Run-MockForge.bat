@echo off
title MockForge Studio Launcher
echo ===================================================
echo             ❖ MockForge Studio ❖
echo      3D Perspective Mockup Generator App
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/2] Starting MockForge App Server...
start /min "MockForge Server" cmd /c "npm run dev"

echo [2/2] Opening MockForge Studio Window...
timeout /t 2 /nobreak >nul

:: Launch standalone desktop app window (Chrome / Edge / Default Browser)
start chrome --app="http://localhost:5173" 2>nul || start msedge --app="http://localhost:5173" 2>nul || start http://localhost:5173

echo.
echo ❖ MockForge Studio is active!
echo Server URL: http://localhost:5173
echo.
echo Close this window when you want to exit MockForge Studio.
