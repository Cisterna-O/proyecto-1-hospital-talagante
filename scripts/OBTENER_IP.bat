@echo off
chcp 65001 >nul
title Obtener IP de Red
color 0E

echo.
echo ════════════════════════════════════════════════════════════
echo    📡 OBTENER IP DE RED
echo ════════════════════════════════════════════════════════════
echo.

echo Tu(s) dirección(es) IP de red:
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4"') do (
    echo  ➤%%a
)

echo.
echo ════════════════════════════════════════════════════════════
echo Para acceder desde otros dispositivos en la misma red:
echo.
echo   Frontend: http://TU_IP:5173
echo   Backend:  http://TU_IP:8000
echo   API Docs: http://TU_IP:8000/docs
echo ════════════════════════════════════════════════════════════
echo.
pause
