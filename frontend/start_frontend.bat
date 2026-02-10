@echo off
title Hospital Talagante - Frontend
color 0A
cd /d "%~dp0"

echo.
echo ════════════════════════════════════════════════════════════
echo    🏥 HOSPITAL TALAGANTE - FRONTEND
echo ════════════════════════════════════════════════════════════
echo.

if not exist "node_modules\" (
    echo Instalando dependencias...
    call npm install
    if errorlevel 1 (
        echo ❌ ERROR: No se pudieron instalar las dependencias
        pause
        exit /b 1
    )
)

echo Iniciando servidor de desarrollo...
echo.
echo Frontend disponible en:
echo   - http://localhost:5173
echo.
echo Para acceder desde otros dispositivos:
echo   1. Ejecuta: ..\scripts\OBTENER_IP.bat
echo   2. Accede desde: http://TU_IP:5173
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

npm run dev

pause
