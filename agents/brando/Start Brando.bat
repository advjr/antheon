@echo off
setlocal

rem Launches the Brando web chat server and opens it in your browser.
rem Double-click this file — no terminal typing required.

cd /d "%~dp0.."

echo Starting Brando web server...
start "Brando web server" cmd /k npm run brando:web

rem Give the server a moment to boot before opening the browser.
timeout /t 3 /nobreak >nul

start "" "http://127.0.0.1:4317"

endlocal
