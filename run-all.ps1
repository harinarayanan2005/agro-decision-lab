# AgriAI Decision Intelligence Platform - PowerShell Launcher
Write-Host "===================================================================" -ForegroundColor Green
Write-Host "         AgriAI Decision Intelligence Platform - Launcher" -ForegroundColor Green
Write-Host "===================================================================" -ForegroundColor Green

$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $RootDir "backend"
$FrontendDir = Join-Path $RootDir "agri-decision-lab"

Write-Host "`n[1/4] Checking Python Virtual Environment..." -ForegroundColor Cyan
if (-not (Test-Path "$BackendDir\venv")) {
    Write-Host "[*] Creating Python Virtual Environment (venv)..." -ForegroundColor Yellow
    python -m venv "$BackendDir\venv"
    Write-Host "[*] Installing ML Packages..." -ForegroundColor Yellow
    & "$BackendDir\venv\Scripts\pip.exe" install numpy pandas scikit-learn joblib
} else {
    Write-Host "[OK] Python venv is ready." -ForegroundColor Green
}

Write-Host "`n[2/4] Starting Spring Boot Backend (Port 8081)..." -ForegroundColor Cyan
Start-Process cmd.exe -ArgumentList "/k", "cd /d `"$BackendDir`" && call venv\Scripts\activate.bat && mvnw.cmd spring-boot:run"

Write-Host "`n[3/4] Starting Frontend Dev Server (Port 5173)..." -ForegroundColor Cyan
Start-Process cmd.exe -ArgumentList "/k", "cd /d `"$FrontendDir`" && npm.cmd run dev"

Write-Host "`n[4/4] Launching Browser..." -ForegroundColor Cyan
Start-Sleep -Seconds 5
Start-Process "http://localhost:5173"

Write-Host "`n[SUCCESS] AgriAI Platform is launching at http://localhost:5173" -ForegroundColor Green
