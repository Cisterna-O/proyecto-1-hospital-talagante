#!/bin/bash

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

clear
echo -e "${BLUE}========================================================"
echo "  HOSPITAL TALAGANTE - INFORMACION DE RED"
echo -e "========================================================${NC}"
echo ""
echo -e "${YELLOW}Tu direccion IP local es:${NC}"
echo ""

# Para Linux
if command -v ip &> /dev/null; then
    ip addr show | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | cut -d/ -f1
fi

# Para Mac
if command -v ifconfig &> /dev/null; then
    ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}'
fi

echo ""
echo -e "${GREEN}========================================================"
echo "  COMO ACCEDER DESDE OTROS DISPOSITIVOS"
echo -e "========================================================${NC}"
echo ""
echo "1. Asegurate de que el sistema este corriendo"
echo "2. Desde otro dispositivo en la misma red WiFi/LAN"
echo "3. Abre el navegador y ve a: http://TU_IP:5173"
echo ""
echo "Ejemplo: Si tu IP es 192.168.1.100"
echo "         Accede desde: http://192.168.1.100:5173"
echo ""
echo -e "${YELLOW}IMPORTANTE: Ambos dispositivos deben estar en la misma red${NC}"
echo -e "${GREEN}========================================================${NC}"
echo ""