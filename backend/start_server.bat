@echo off
title Hospital Talagante - Backend Server
color 0B
cd /d "%~dp0"

echo.
echo ════════════════════════════════════════════════════════════
echo    🏥 HOSPITAL TALAGANTE - BACKEND SERVER
echo ════════════════════════════════════════════════════════════
echo.

if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
) else (
    echo ❌ ERROR: Entorno virtual no encontrado
    echo    Ejecuta primero: python -m venv venv
    pause
    exit /b 1
)

echo ✅ Entorno virtual activado
echo.
echo Iniciando servidor FastAPI...
echo.
echo Backend disponible en:
echo   - http://localhost:8000
echo   - http://localhost:8000/docs (Documentación API)
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

uvicorn main:app --host 0.0.0.0 --port 8000 --reload

pause
