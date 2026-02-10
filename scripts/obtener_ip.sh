#!/bin/bash

echo ""
echo "════════════════════════════════════════════════════════════"
echo "   📡 OBTENER IP DE RED"
echo "════════════════════════════════════════════════════════════"
echo ""

echo "Tu(s) dirección(es) IP de red:"
echo ""

# Linux
if command -v ip &> /dev/null; then
    ip addr show | grep "inet " | grep -v 127.0.0.1 | awk '{print "  ➤", $2}' | cut -d/ -f1
# macOS  
elif command -v ifconfig &> /dev/null; then
    ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print "  ➤", $2}'
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "Para acceder desde otros dispositivos en la misma red:"
echo ""
echo "  Frontend: http://TU_IP:5173"
echo "  Backend:  http://TU_IP:8000"
echo "  API Docs: http://TU_IP:8000/docs"
echo "════════════════════════════════════════════════════════════"
echo ""
