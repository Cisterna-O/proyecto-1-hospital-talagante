@echo off
echo Configurando reglas de Firewall para Hospital Talagante...
echo.
echo NOTA: Este script debe ejecutarse como Administrador
echo.

REM Agregar regla para Backend (Puerto 8000)
netsh advfirewall firewall add rule name="Hospital Talagante - Backend" dir=in action=allow protocol=TCP localport=8000

REM Agregar regla para Frontend (Puerto 5173)
netsh advfirewall firewall add rule name="Hospital Talagante - Frontend" dir=in action=allow protocol=TCP localport=5173

echo.
echo Reglas de Firewall configuradas correctamente
echo - Backend: Puerto 8000
echo - Frontend: Puerto 5173
echo.
pause