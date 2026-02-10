#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "   🏥 HOSPITAL TALAGANTE - SISTEMA DE IMAGENOLOGÍA"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Iniciando sistema completo..."
echo ""

# Verificar si estamos en la carpeta correcta
if [ ! -f "backend/main.py" ]; then
    if [ -f "Proyecto/backend/main.py" ]; then
        cd Proyecto
    else
        echo -e "${RED}❌ ERROR: No se encuentra la estructura del proyecto${NC}"
        echo ""
        echo "Asegúrate de ejecutar este script desde:"
        echo "  - La carpeta raíz del proyecto, o"
        echo "  - La carpeta Proyecto/"
        echo ""
        exit 1
    fi
fi

echo -e "${GREEN}✅ Carpeta del proyecto encontrada${NC}"
echo ""

# ════════════════════════════════════════════════════════════
# PASO 1: Verificar requisitos
# ════════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════"
echo "PASO 1: Verificando requisitos del sistema..."
echo "═══════════════════════════════════════════════════════════"
echo ""

# Verificar Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
    echo -e "${GREEN}✅ Python $PYTHON_VERSION instalado${NC}"
else
    echo -e "${RED}❌ Python 3 no está instalado${NC}"
    echo "   Instálalo desde: https://www.python.org/"
    exit 1
fi

# Verificar Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js $NODE_VERSION instalado${NC}"
else
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    echo "   Instálalo desde: https://nodejs.org/"
    exit 1
fi

# Verificar PostgreSQL
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version | awk '{print $3}')
    echo -e "${GREEN}✅ PostgreSQL $PSQL_VERSION instalado${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL no detectado en PATH${NC}"
    echo "   Si ya está instalado, verifica la configuración"
fi

echo ""

# ════════════════════════════════════════════════════════════
# PASO 2: Verificar base de datos
# ════════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════"
echo "PASO 2: Verificando base de datos..."
echo "═══════════════════════════════════════════════════════════"
echo ""

# Verificar si la BD existe
if psql -U postgres -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw hospital_talagante; then
    echo -e "${GREEN}✅ Base de datos 'hospital_talagante' encontrada${NC}"
else
    echo -e "${YELLOW}⚠️  Base de datos 'hospital_talagante' no encontrada${NC}"
    echo ""
    read -p "¿Deseas crearla ahora? (S/N): " crear_bd
    if [[ $crear_bd =~ ^[Ss]$ ]]; then
        echo ""
        echo "Creando base de datos..."
        psql -U postgres -c "CREATE DATABASE hospital_talagante;" 2>/dev/null
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Base de datos creada${NC}"
            echo ""
            echo "Cargando esquema..."
            PGCLIENTENCODING=UTF8 psql -U postgres -d hospital_talagante -f database/schema.sql
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ Esquema cargado correctamente${NC}"
            else
                echo -e "${YELLOW}⚠️  Hubo errores al cargar el esquema${NC}"
                echo "   Revisa el archivo database/schema.sql"
            fi
        else
            echo -e "${RED}❌ Error al crear la base de datos${NC}"
            echo "   Verifica que PostgreSQL esté corriendo y tengas permisos"
            exit 1
        fi
    fi
fi

echo ""

# ════════════════════════════════════════════════════════════
# PASO 3: Configurar Backend
# ════════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════"
echo "PASO 3: Configurando Backend..."
echo "═══════════════════════════════════════════════════════════"
echo ""

cd backend

# Verificar entorno virtual
if [ ! -d "venv" ]; then
    echo "Creando entorno virtual..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Error al crear entorno virtual${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Entorno virtual creado${NC}"
fi

# Activar entorno virtual
source venv/bin/activate
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al activar entorno virtual${NC}"
    exit 1
fi

# Instalar/actualizar dependencias
echo ""
echo "Instalando dependencias de Python..."
pip install -r requirements.txt --quiet
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al instalar dependencias${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Dependencias instaladas${NC}"

# Verificar .env
if [ ! -f ".env" ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Archivo .env no encontrado${NC}"
    if [ -f ".env.example" ]; then
        echo "Copiando .env.example a .env..."
        cp .env.example .env
        echo ""
        echo -e "${YELLOW}⚠️  IMPORTANTE: Debes configurar el archivo backend/.env con tus valores${NC}"
        echo "   Edita especialmente:"
        echo "   - DATABASE_URL"
        echo "   - SECRET_KEY"
        echo "   - ADMIN_SECRET_KEY"
        echo ""
        read -p "Presiona Enter para continuar..."
    else
        echo -e "${RED}❌ Tampoco existe .env.example${NC}"
        echo "   Crea un archivo .env manualmente"
        exit 1
    fi
fi

cd ..

echo ""

# ════════════════════════════════════════════════════════════
# PASO 4: Configurar Frontend
# ════════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════"
echo "PASO 4: Configurando Frontend..."
echo "═══════════════════════════════════════════════════════════"
echo ""

cd frontend

# Verificar node_modules
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias de Node.js..."
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Error al instalar dependencias${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Dependencias instaladas${NC}"
else
    echo -e "${GREEN}✅ Dependencias ya instaladas${NC}"
fi

cd ..

echo ""

# ════════════════════════════════════════════════════════════
# PASO 5: Iniciar Servicios
# ════════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════"
echo "PASO 5: Iniciando servicios..."
echo "═══════════════════════════════════════════════════════════"
echo ""

echo -e "${BLUE}🚀 Iniciando Backend en http://localhost:8000${NC}"
echo -e "${BLUE}🚀 Iniciando Frontend en http://localhost:5173${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "   - Se abrirán 2 procesos en background"
echo "   - Para detener el sistema, presiona Ctrl+C"
echo ""

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo "Deteniendo servicios..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "Sistema detenido"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Iniciar Backend
cd backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

# Esperar a que el backend inicie
sleep 3

# Iniciar Frontend
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Esperar a que el frontend inicie
sleep 5

echo ""
echo "═══════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Sistema iniciado correctamente${NC}"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "🌐 Accede al sistema en:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "📱 Para acceder desde otros dispositivos:"
echo "   1. Ejecuta: ./scripts/obtener_ip.sh"
echo "   2. Usa: http://TU_IP:5173"
echo ""
echo "Presiona Ctrl+C para detener el sistema"
echo ""

# Mantener el script corriendo
wait
