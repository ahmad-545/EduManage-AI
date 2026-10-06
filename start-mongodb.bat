@echo off
echo ===================================================
echo   EduManage AI - Starting MongoDB Database Server
echo ===================================================
echo.

:: Check if running with Admin privileges
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [INFO] Running with Administrator privileges.
    echo [INFO] Starting MongoDB Server Service...
    net start MongoDB
    echo.
    echo [SUCCESS] MongoDB Server is now RUNNING!
    echo You can now login or connect via MongoDB Compass.
) else (
    echo [INFO] Requesting Administrator elevation to start MongoDB...
    powershell -Command "Start-Process cmd -Verb RunAs -ArgumentList '/c net start MongoDB && echo. && echo [SUCCESS] MongoDB service started! && pause'"
)

echo.
pause
