#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

clear
echo -e "${BLUE}========================================================"
echo "  HOSPITAL TALAGANTE - SISTEMA DE GESTION DE EXAMENES"
echo -e "========================================================${NC}"
echo ""
echo "Verificando servicios..."
echo ""

# Verificar si PostgreSQL está corriendo
if pgrep -x "postgres" > /dev/null; then
    echo -e "${GREEN}[OK]${NC} PostgreSQL esta corriendo"
else
    echo -e "${RED}[ERROR]${NC} PostgreSQL no esta corriendo"
    echo "Por favor inicia PostgreSQL primero"
    echo "Ubuntu/Debian: sudo systemctl start postgresql"
    echo "Mac: brew services start postgresql"
    exit 1
fi

echo ""
echo "Iniciando servicios del sistema..."
echo ""

# Obtener directorio del script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Iniciar Backend
echo "Iniciando Backend..."
cd "$SCRIPT_DIR/backend"
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Esperar 3 segundos
sleep 3

# Iniciar Frontend
echo "Iniciando Frontend..."
cd "$SCRIPT_DIR/frontend"
npm run dev -- --host 0.0.0.0 &
FRONTEND_PID=$!

# Esperar 5 segundos
sleep 5

echo ""
echo -e "${GREEN}========================================================"
echo "  SISTEMA INICIADO CORRECTAMENTE"
echo -e "========================================================${NC}"
echo ""
echo -e "${YELLOW}Backend API:${NC}     http://localhost:8000"
echo -e "${YELLOW}Documentacion:${NC}   http://localhost:8000/docs (solo local)"
echo -e "${YELLOW}Frontend Web:${NC}    http://localhost:5173"
echo ""
echo "Para acceder desde otros dispositivos en la red:"
echo "1. Obtener tu IP local con: ifconfig o ip addr"
echo "2. Acceder desde: http://TU_IP:5173"
echo ""
echo -e "${RED}Presiona Ctrl+C para detener todos los servicios${NC}"
echo ""

# Función para limpiar al salir
cleanup() {
    echo ""
    echo "Deteniendo servicios..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "Sistema detenido"
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT SIGTERM

# Mantener script corriendo
wait