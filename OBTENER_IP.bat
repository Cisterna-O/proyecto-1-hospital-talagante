@echo off
color 0B
echo ========================================================
echo   HOSPITAL TALAGANTE - INFORMACION DE RED
echo ========================================================
echo.
echo Tu direccion IP local es:
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    echo %%a
)

echo.
echo ========================================================
echo   COMO ACCEDER DESDE OTROS DISPOSITIVOS
echo ========================================================
echo.
echo 1. Asegurate de que el sistema este corriendo
echo 2. Desde otro dispositivo en la misma red WiFi/LAN
echo 3. Abre el navegador y ve a: http://TU_IP:5173
echo.
echo Ejemplo: Si tu IP es 192.168.1.100
echo          Accede desde: http://192.168.1.100:5173
echo.
echo IMPORTANTE: Ambos dispositivos deben estar en la misma red
echo ========================================================
echo.
pause