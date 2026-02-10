@echo off
chcp 65001 >nul
title Hospital Talagante - Iniciar Sistema Completo
color 0A

echo.
echo ═══════════════════════════════════════════════════════════
echo    🏥 HOSPITAL TALAGANTE - SISTEMA DE IMAGENOLOGÍA
echo ═══════════════════════════════════════════════════════════
echo.
echo Iniciando sistema completo...
echo.

REM Verificar si estamos en la carpeta correcta
if not exist "backend\main.py" (
    if not exist "Proyecto\backend\main.py" (
        echo ❌ ERROR: No se encuentra la estructura del proyecto
        echo.
        echo Asegúrate de ejecutar este script desde:
        echo   - La carpeta raíz del proyecto, o
        echo   - La carpeta Proyecto/
        echo.
        pause
        exit /b 1
    ) else (
        cd Proyecto
    )
)

echo ✅ Carpeta del proyecto encontrada
echo.

REM ════════════════════════════════════════════════════════════
REM PASO 1: Verificar requisitos
REM ════════════════════════════════════════════════════════════
echo ═══════════════════════════════════════════════════════════
echo PASO 1: Verificando requisitos del sistema...
echo ═══════════════════════════════════════════════════════════
echo.

REM Verificar Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python no está instalado
    echo    Descárgalo desde: https://www.python.org/
    pause
    exit /b 1
) else (
    for /f "tokens=2" %%i in ('python --version 2^>^&1') do echo ✅ Python %%i instalado
)

REM Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no está instalado
    echo    Descárgalo desde: https://nodejs.org/
    pause
    exit /b 1
) else (
    for /f %%i in ('node --version') do echo ✅ Node.js %%i instalado
)

REM Verificar PostgreSQL
psql --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  PostgreSQL no detectado en PATH
    echo    Si ya está instalado, verifica la configuración
) else (
    for /f "tokens=3" %%i in ('psql --version') do echo ✅ PostgreSQL %%i instalado
)

echo.

REM ════════════════════════════════════════════════════════════
REM PASO 2: Verificar base de datos
REM ════════════════════════════════════════════════════════════
echo ═══════════════════════════════════════════════════════════
echo PASO 2: Verificando base de datos...
echo ═══════════════════════════════════════════════════════════
echo.

REM Verificar si la BD existe
psql -U postgres -lqt 2>nul | findstr /C:"hospital_talagante" >nul
if errorlevel 1 (
    echo ⚠️  Base de datos 'hospital_talagante' no encontrada
    echo.
    echo ¿Deseas crearla ahora? (S/N)
    set /p crear_bd=^> 
    if /i "!crear_bd!"=="S" (
        echo.
        echo Creando base de datos...
        psql -U postgres -c "CREATE DATABASE hospital_talagante;" 2>nul
        if errorlevel 1 (
            echo ❌ Error al crear la base de datos
            echo    Verifica que PostgreSQL esté corriendo y tengas permisos
            pause
            exit /b 1
        ) else (
            echo ✅ Base de datos creada
            echo.
            echo Cargando esquema...
            powershell -Command "$env:PGCLIENTENCODING='UTF8'; psql -U postgres -d hospital_talagante -f database/schema.sql"
            if errorlevel 1 (
                echo ⚠️  Hubo errores al cargar el esquema
                echo    Revisa el archivo database/schema.sql
            ) else (
                echo ✅ Esquema cargado correctamente
            )
        )
    )
) else (
    echo ✅ Base de datos 'hospital_talagante' encontrada
)

echo.

REM ════════════════════════════════════════════════════════════
REM PASO 3: Configurar Backend
REM ════════════════════════════════════════════════════════════
echo ═══════════════════════════════════════════════════════════
echo PASO 3: Configurando Backend...
echo ═══════════════════════════════════════════════════════════
echo.

cd backend

REM Verificar entorno virtual
if not exist "venv\" (
    echo Creando entorno virtual...
    python -m venv venv
    if errorlevel 1 (
        echo ❌ Error al crear entorno virtual
        pause
        exit /b 1
    )
    echo ✅ Entorno virtual creado
)

REM Activar entorno virtual
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ❌ Error al activar entorno virtual
    pause
    exit /b 1
)

REM Instalar/actualizar dependencias
echo.
echo Instalando dependencias de Python...
pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo ❌ Error al instalar dependencias
    pause
    exit /b 1
)
echo ✅ Dependencias instaladas

REM Verificar .env
if not exist ".env" (
    echo.
    echo ⚠️  Archivo .env no encontrado
    if exist ".env.example" (
        echo Copiando .env.example a .env...
        copy .env.example .env >nul
        echo.
        echo ⚠️  IMPORTANTE: Debes configurar el archivo backend/.env con tus valores
        echo    Edita especialmente:
        echo    - DATABASE_URL
        echo    - SECRET_KEY
        echo    - ADMIN_SECRET_KEY
        echo.
        pause
    ) else (
        echo ❌ Tampoco existe .env.example
        echo    Crea un archivo .env manualmente
        pause
        exit /b 1
    )
)

cd ..

echo.

REM ════════════════════════════════════════════════════════════
REM PASO 4: Configurar Frontend
REM ════════════════════════════════════════════════════════════
echo ═══════════════════════════════════════════════════════════
echo PASO 4: Configurando Frontend...
echo ═══════════════════════════════════════════════════════════
echo.

cd frontend

REM Verificar node_modules
if not exist "node_modules\" (
    echo Instalando dependencias de Node.js...
    call npm install
    if errorlevel 1 (
        echo ❌ Error al instalar dependencias
        pause
        exit /b 1
    )
    echo ✅ Dependencias instaladas
) else (
    echo ✅ Dependencias ya instaladas
)

cd ..

echo.

REM ════════════════════════════════════════════════════════════
REM PASO 5: Iniciar Servicios
REM ════════════════════════════════════════════════════════════
echo ═══════════════════════════════════════════════════════════
echo PASO 5: Iniciando servicios...
echo ═══════════════════════════════════════════════════════════
echo.

echo 🚀 Iniciando Backend en http://localhost:8000
echo 🚀 Iniciando Frontend en http://localhost:5173
echo.
echo ⚠️  IMPORTANTE:
echo    - Se abrirán 2 ventanas de terminal
echo    - NO cierres ninguna ventana mientras uses el sistema
echo    - Para detener el sistema, cierra ambas ventanas
echo.
pause

REM Iniciar Backend en nueva ventana
start "Hospital Talagante - Backend" cmd /k "cd /d %CD%\backend && call venv\Scripts\activate.bat && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

REM Esperar 3 segundos para que el backend inicie
timeout /t 3 /nobreak >nul

REM Iniciar Frontend en nueva ventana
start "Hospital Talagante - Frontend" cmd /k "cd /d %CD%\frontend && npm run dev"

REM Esperar 5 segundos y abrir navegador
timeout /t 5 /nobreak >nul

echo.
echo ═══════════════════════════════════════════════════════════
echo ✅ Sistema iniciado correctamente
echo ═══════════════════════════════════════════════════════════
echo.
echo 🌐 Accede al sistema en:
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:8000
echo    API Docs: http://localhost:8000/docs
echo.
echo 📱 Para acceder desde otros dispositivos:
echo    1. Ejecuta: OBTENER_IP.bat
echo    2. Usa: http://TU_IP:5173
echo.

REM Abrir navegador
start http://localhost:5173

echo Presiona cualquier tecla para cerrar esta ventana...
echo (Las ventanas de Backend y Frontend seguirán abiertas)
pause >nul
