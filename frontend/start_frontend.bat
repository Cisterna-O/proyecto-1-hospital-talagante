@echo off
echo ==========================================
echo  HOSPITAL TALAGANTE - INTERFAZ WEB
echo ==========================================
echo.
echo Iniciando interfaz web...
echo.

cd /d "%~dp0"
npm run dev -- --host 0.0.0.0

pause