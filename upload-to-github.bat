@echo off
setlocal
echo ===================================================
echo   ProofMock - Automatic GitHub Repository Uploader
echo ===================================================
echo Target Repository: https://github.com/iamtamyansari-maker/ProofMock.git
echo.

:: Refresh PATH to locate Git if recently installed
if exist "C:\Program Files\Git\cmd\git.exe" set "PATH=%PATH%;C:\Program Files\Git\cmd"
if exist "C:\Program Files (x86)\Git\cmd\git.exe" set "PATH=%PATH%;C:\Program Files (x86)\Git\cmd"
if exist "%USERPROFILE%\AppData\Local\Programs\Git\cmd\git.exe" set "PATH=%PATH%;%USERPROFILE%\AppData\Local\Programs\Git\cmd"

where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git is not found in system PATH.
    echo If you just installed Git, please restart your terminal or computer and run this script again.
    pause
    exit /b 1
)

echo [1/5] Configuring Git user identity...
git config user.email "iamtamyansari@gmail.com"
git config user.name "Taimoor Ansari"

echo [2/5] Initializing Git repository...
git init

echo [3/5] Staging files...
git add .

echo [4/5] Creating release commit...
git commit -m "Initial release of ProofMock 3D Perspective Mockup Generator v1.0.0"

echo [5/5] Setting remote repository and pushing to GitHub...
git branch -M main
git remote remove origin >nul 2>nul
git remote add origin https://github.com/iamtamyansari-maker/ProofMock.git

echo.
echo Pushing code to https://github.com/iamtamyansari-maker/ProofMock/tree/main ...
git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo [NOTE] If a browser window or login prompt popped up, please complete the GitHub login.
    echo Or run: git push -u origin main
) else (
    echo.
    echo ===================================================
    echo   🎉 Success! ProofMock is live on GitHub!
    echo ===================================================
)

pause
