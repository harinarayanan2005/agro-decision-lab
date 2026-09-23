@echo off
title AgriAI Intelligence System - One-Click Launcher
color 0A

echo ===================================================================
echo               AgriAI Decision Intelligence Platform
echo                 Automated Environment & System Boot
echo ===================================================================
echo.

set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%backend"
set "FRONTEND_DIR=%ROOT_DIR%agri-decision-lab"

echo [1/4] Checking Python Virtual Environment...
if not exist "%BACKEND_DIR%\venv" (
    echo [*] Creating Python Virtual Environment (venv)...
    python -m venv "%BACKEND_DIR%\venv"
    echo [*] Installing ML Dependencies (numpy, pandas, scikit-learn, joblib)...
    call "%BACKEND_DIR%\venv\Scripts\activate.bat"
    pip install numpy pandas scikit-learn joblib
) else (
    echo [OK] Python venv verified.
)

echo.
echo [2/4] Launching Spring Boot AI Backend Server (Port 8081)...
start "AgriAI Backend Server" /D "%BACKEND_DIR%" cmd /k "call venv\Scripts\activate.bat && mvnw.cmd spring-boot:run"

echo.
echo [3/4] Launching React + Vite Frontend Dashboard (Port 5173)...
start "AgriAI Frontend Dashboard" /D "%FRONTEND_DIR%" cmd /k "npm.cmd run dev"

echo.
echo [4/4] Opening Web Interface in Default Browser...
timeout /t 5 >nul
start http://localhost:5173

echo.
echo ===================================================================
echo   [SUCCESS] Both Backend (8081) and Frontend (5173) are running!
echo   Keep the two launcher terminal windows open while using the app.
echo ===================================================================
timeout /t 3 >nul
exit
