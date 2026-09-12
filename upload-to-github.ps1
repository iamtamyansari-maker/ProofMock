# ProofMock GitHub Upload Script
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  ProofMock - Automatic GitHub Repository Uploader" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Target Repository: https://github.com/iamtamyansari-maker/ProofMock.git`n" -ForegroundColor Yellow

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Git is not installed or not in system PATH." -ForegroundColor Red
    Write-Host "Please download & install Git from: https://git-scm.com/downloads" -ForegroundColor Red
    Read-Host -Prompt "Press Enter to exit..."
    exit 1
}

Write-Host "[1/5] Initializing Git repository..." -ForegroundColor Green
git init

Write-Host "[2/5] Staging project files..." -ForegroundColor Green
git add .

Write-Host "[3/5] Creating initial commit..." -ForegroundColor Green
git commit -m "Initial release of ProofMock 3D Perspective Mockup Generator v1.0.0"

Write-Host "[4/5] Setting main branch & remote..." -ForegroundColor Green
git branch -M main
git remote remove origin 2>$null
git remote add origin https://github.com/iamtamyansari-maker/ProofMock.git

Write-Host "[5/5] Pushing to GitHub..." -ForegroundColor Green
git push -u origin main

Write-Host "`n🎉 Success! ProofMock is live at https://github.com/iamtamyansari-maker/ProofMock/tree/main" -ForegroundColor Cyan
