@echo off
echo ===================================================
echo   ProofMock - Automatic GitHub Repository Uploader
echo ===================================================
echo Target Repository: https://github.com/iamtamyansari-maker/ProofMock.git
echo.

where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed or not in system PATH.
    echo Please install Git from https://git-scm.com/downloads and try again.
    pause
    exit /b 1
)

echo [1/5] Initializing Git repository...
git init

echo [2/5] Staging files...
git add .

echo [3/5] Creating initial release commit...
git commit -m "Initial release of ProofMock 3D Perspective Mockup Generator v1.0.0"

echo [4/5] Setting main branch & remote...
git branch -M main
git remote remove origin >nul 2>nul
git remote add origin https://github.com/iamtamyansari-maker/ProofMock.git

echo [5/5] Pushing to GitHub (https://github.com/iamtamyansari-maker/ProofMock/tree/main)...
git push -u origin main

echo.
echo ===================================================
echo   Success! ProofMock is now live on GitHub!
echo ===================================================
pause
