@echo off
chcp 65001 >nul
title Configurar Firewall Windows
color 0C

echo.
echo ════════════════════════════════════════════════════════════
echo    🛡️  CONFIGURAR FIREWALL WINDOWS
echo ════════════════════════════════════════════════════════════
echo.
echo Este script abre los puertos 8000 y 5173 en el Firewall de
echo Windows para permitir acceso desde otros dispositivos.
echo.
echo ⚠️  IMPORTANTE: Requiere permisos de Administrador
echo.
pause

echo.
echo Abriendo puerto 8000 (Backend)...
netsh advfirewall firewall add rule name="Hospital Talagante - Backend" dir=in action=allow protocol=TCP localport=8000
if errorlevel 1 (
    echo ❌ Error al configurar puerto 8000
) else (
    echo ✅ Puerto 8000 configurado
)

echo.
echo Abriendo puerto 5173 (Frontend)...
netsh advfirewall firewall add rule name="Hospital Talagante - Frontend" dir=in action=allow protocol=TCP localport=5173
if errorlevel 1 (
    echo ❌ Error al configurar puerto 5173
) else (
    echo ✅ Puerto 5173 configurado
)

echo.
echo ════════════════════════════════════════════════════════════
echo ✅ Firewall configurado correctamente
echo ════════════════════════════════════════════════════════════
echo.
echo Ahora puedes acceder al sistema desde otros dispositivos
echo en la misma red usando la IP de este equipo.
echo.
echo 💡 Ejecuta OBTENER_IP.bat para ver tu IP
echo.
pause
