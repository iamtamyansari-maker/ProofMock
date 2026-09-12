# ProofMock GitHub Upload Script
$env:Path += ";C:\Program Files\Git\cmd;C:\Program Files (x86)\Git\cmd;$env:USERPROFILE\AppData\Local\Programs\Git\cmd"

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  ProofMock - Automatic GitHub Repository Uploader" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Target Repository: https://github.com/iamtamyansari-maker/ProofMock.git`n" -ForegroundColor Yellow

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Git executable not found in system PATH." -ForegroundColor Red
    Write-Host "Please restart your PowerShell window or computer after installing Git." -ForegroundColor Red
    Read-Host -Prompt "Press Enter to exit..."
    exit 1
}

Write-Host "[1/5] Setting Git author identity..." -ForegroundColor Green
git config user.email "iamtamyansari@gmail.com"
git config user.name "Taimoor Ansari"

Write-Host "[2/5] Initializing Git repository..." -ForegroundColor Green
git init

Write-Host "[3/5] Staging files..." -ForegroundColor Green
git add .

Write-Host "[4/5] Creating release commit..." -ForegroundColor Green
git commit -m "Initial release of ProofMock 3D Perspective Mockup Generator v1.0.0"

Write-Host "[5/5] Setting remote repository and pushing to GitHub..." -ForegroundColor Green
git branch -M main
git remote remove origin 2>$null
git remote add origin https://github.com/iamtamyansari-maker/ProofMock.git

Write-Host "`nPushing code to GitHub..." -ForegroundColor Yellow
git push -u origin HEAD:main --force

Write-Host "`n🎉 Success! ProofMock is live at https://github.com/iamtamyansari-maker/ProofMock/tree/main" -ForegroundColor Cyan
Read-Host -Prompt "Press Enter to exit..."
