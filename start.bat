@echo off
set "PATH=%PATH%;C:\Program Files\nodejs"
echo Starting Rakshak Sentinel...

echo Launching Backend (Port 3000)...
start "Rakshak Backend" cmd /k "cd server && npm start"

echo Launching Frontend (Port 5173)...
start "Rakshak Frontend" cmd /k "cd client && npm run dev"

echo.
echo ===================================================
echo Servers should be running in new windows.
echo Frontend: http://localhost:5173
echo External: http://172.16.14.196:5173
echo ===================================================
echo.
pause
