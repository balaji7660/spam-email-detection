@echo off
echo ===================================================
echo Starting Defensor AI - Spam Email Detection System
echo ===================================================

echo [1/2] Starting Python ML Backend (listening on Port 5000)...
start "Defensor AI - Backend ML API" cmd /k ".\venv\Scripts\activate.bat && python backend\app.py"

echo [2/2] Starting Frontend Web Server (listening on Port 8000)...
start "Defensor AI - Frontend UI" cmd /k "python -m http.server 8000"

echo Services started successfully!
echo Launching your browser...
ping 127.0.0.1 -n 3 > nul
start http://localhost:8000/index.html
