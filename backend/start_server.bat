@echo off
echo ==========================================
echo  HOSPITAL TALAGANTE - SERVIDOR BACKEND
echo ==========================================
echo.
echo Iniciando servidor en red local...
echo Backend disponible en: http://0.0.0.0:8000
echo.

cd /d "%~dp0"
call venv\Scripts\activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

pause