# 🏥 Sistema de Gestión de Exámenes Médicos - Hospital Talagante

Sistema completo para la gestión de exámenes de imagenología (TAC, RX, ECO) con control de usuarios, filtros avanzados, generación de reportes y gráficos estadísticos.

## 📋 Características

- ✅ Gestión de exámenes TAC, RX y ECO
- ✅ Control de usuarios (Administrador e Ingresador)
- ✅ Filtros avanzados por fecha, atención, previsión, etc.
- ✅ Gráficos estadísticos obligatorios y opcionales
- ✅ Exportación a Excel de exámenes y gráficos
- ✅ Importación de respaldo desde Excel (sin duplicados)
- ✅ Autocomplete de pacientes por RUT
- ✅ Cálculo automático de edad
- ✅ Sistema de revisión de exámenes
- ✅ Soft delete (eliminación lógica)
- ✅ Auditoría completa (created_by, updated_by, timestamps)
- ✅ Acceso desde red local (múltiples dispositivos)
- ✅ Auto-inicio rápido después de cortes de luz
- ✅ Registro de administradores con clave secreta

## 🛠️ Tecnologías

**Backend:**
- Python 3.11+
- FastAPI
- PostgreSQL 14+
- SQLAlchemy
- Pandas & OpenPyXL

**Frontend:**
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Chart.js

## 📥 Instalación

### Prerrequisitos

Descargar e instalar en este orden:

1. **Python 3.11 o superior**
   - Descarga: https://www.python.org/downloads/
   - ⚠️ IMPORTANTE: Durante instalación marcar ☑️ "Add Python to PATH"

2. **Node.js 18 o superior**
   - Descarga: https://nodejs.org/
   - Incluye npm automáticamente

3. **PostgreSQL 14 o superior**
   - Windows: https://www.postgresql.org/download/windows/
   - Linux: `sudo apt install postgresql postgresql-contrib`
   - Mac: `brew install postgresql@14`
   - ⚠️ IMPORTANTE: Recordar contraseña del usuario `postgres`

4. **Git** (opcional, si clonas desde GitHub)
   - Descarga: https://git-scm.com/downloads

### Paso 1: Obtener el Proyecto

**Opción A: Clonar desde GitHub**
```bash
git clone https://github.com/Cisterna-O/proyecto-1-hospital-talagante.git
cd hospital-talagante/Proyecto
```

**Opción B: Descargar ZIP**
1. Descargar ZIP desde GitHub
2. Extraer en la ubicación deseada
3. Abrir terminal en carpeta `Proyecto/`

### Paso 2: Configurar Base de Datos

#### Windows (pgAdmin):
1. Abrir **pgAdmin**
2. Conectarse al servidor PostgreSQL
3. Click derecho en "Databases" → Create → Database
4. Nombre: `hospital_talagante`
5. Click derecho en `hospital_talagante` → Query Tool
6. Abrir archivo `schema.sql` (File → Open)
7. Ejecutar (⚡ o F5)

#### Linux/Mac (Terminal):
```bash
# Crear base de datos
sudo -u postgres psql -c "CREATE DATABASE hospital_talagante;"

# Cargar schema
sudo -u postgres psql -d hospital_talagante -f schema.sql
```

### Paso 3: Configurar Backend
```bash
# Navegar a carpeta backend
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

### Paso 4: Configurar Variables de Entorno

Crear archivo `.env` en `backend/` (copiar desde `.env.example`):
```env
# BASE DE DATOS
DATABASE_URL=postgresql://postgres:TU_PASSWORD@localhost:5432/hospital_talagante

# SEGURIDAD
SECRET_KEY=cambiar-por-clave-segura-aleatoria-32-caracteres-minimo
ADMIN_SECRET_KEY=clave-super-secreta-para-crear-nuevos-administradores

# CORS - Acceso desde red local
# Agregar todas las IPs desde donde se accederá
CORS_ORIGINS=http://localhost:5173,http://IP:5173,http://IP:8000
```

**⚠️ IMPORTANTE:**
- Cambiar `TU_PASSWORD` por tu contraseña de PostgreSQL
- Cambiar `SECRET_KEY` por una clave única (puedes generarla con: `python -c "import secrets; print(secrets.token_urlsafe(32))"`)
- El `ADMIN_SECRET_KEY` se usará para crear nuevos administradores
- Agregar tu IP local a `CORS_ORIGINS` (ver sección "Uso en Red Local")

### Paso 5: Configurar Frontend
```bash
# Navegar a carpeta frontend
cd ../frontend

# Instalar dependencias
npm install
```

### Paso 6: Crear Primer Administrador

**Opción A: Desde la interfaz web (RECOMENDADO)**

1. Iniciar backend y frontend (ver siguiente paso)
2. Ir a `http://localhost:5173`
3. Click en "Registrar Nuevo Administrador"
4. Completar formulario con:
   - RUT: Tu RUT
   - Nombre completo
   - Email
   - Celular
   - Contraseña (mínimo 8 caracteres)
   - Clave secreta: El `ADMIN_SECRET_KEY` que pusiste en `.env`
5. Click "Registrar Administrador"
6. Volver al login e iniciar sesión

**Opción B: Desde FastAPI Docs**

1. Ir a `http://localhost:8000/docs`
2. Buscar `/auth/crear-admin-inicial`
3. Click "Try it out"
4. Completar JSON y ejecutar

## 🚀 Iniciar el Sistema

### OPCIÓN 1: Inicio Automático (RECOMENDADO)

#### Windows:
```bash
# Doble click en:
INICIAR_TODO.bat
```

Esto:
- ✅ Verifica que PostgreSQL esté corriendo
- ✅ Inicia Backend automáticamente
- ✅ Inicia Frontend automáticamente
- ✅ Abre el navegador en la aplicación
- ✅ Todo con un solo click

#### Linux/Mac:
```bash
# Dar permisos la primera vez:
chmod +x iniciar_todo.sh

# Ejecutar:
./iniciar_todo.sh
```

Para detener: Presionar `Ctrl+C` en la terminal

### OPCIÓN 2: Inicio Manual

**Terminal 1 - Backend:**
```bash
cd backend
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Iniciar servidor
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev -- --host 0.0.0.0
```

### URLs de Acceso

- **Frontend (Aplicación):** http://localhost:5173
- **Backend API:** http://localhost:8000
- **Documentación API:** http://localhost:8000/docs (solo desde localhost)

## 🌐 Uso en Red Local

### Configuración para acceso desde otros dispositivos

1. **Obtener tu IP local:**

**Windows:**
```bash
# Doble click en:
OBTENER_IP.bat

# O manualmente:
ipconfig
# Buscar "Dirección IPv4" en tu adaptador de red activo
```

**Linux/Mac:**
```bash
# Ejecutar script:
./obtener_ip.sh

# O manualmente:
ifconfig  # o: ip addr
```

Ejemplo de IP: `192.168.1.100`

2. **Configurar Firewall (Windows):**
```bash
# Ejecutar como Administrador:
CONFIGURAR_FIREWALL.bat
```

Esto abre los puertos 8000 (Backend) y 5173 (Frontend)

**Linux:**
```bash
sudo ufw allow 8000
sudo ufw allow 5173
```

3. **Actualizar CORS en `.env`:**
```env
CORS_ORIGINS=http://localhost:5173,http://192.168.1.100:5173,http://192.168.1.100:8000
```

Reemplazar `192.168.1.100` con tu IP real.

4. **Reiniciar el sistema**

5. **Acceder desde otros dispositivos:**

En cualquier dispositivo en la misma red WiFi/LAN:
```
http://192.168.1.100:5173
```

### Crear URL personalizada (opcional)

Para usar `http://hospital.local` en vez de la IP:

**En el servidor (editar como Administrador):**

Windows: `C:\Windows\System32\drivers\etc\hosts`
Linux/Mac: `/etc/hosts`

Agregar línea:
```
192.168.1.100    hospital.local
```

Actualizar CORS:
```env
CORS_ORIGINS=http://localhost:5173,http://hospital.local:5173
```

Acceder desde: `http://hospital.local:5173`

## ⚡ Auto-inicio después de Corte de Luz (o similares)

### Windows - Tarea Programada

1. Abrir "Programador de tareas"
2. Crear tarea básica:
   - Nombre: "Hospital Talagante"
   - Desencadenador: "Al iniciar el equipo"
   - Acción: "Iniciar programa"
   - Programa: `C:\ruta\completa\Proyecto\INICIAR_TODO.bat`
3. Guardar

### Linux - Systemd Service
```bash
# Copiar archivo de servicio
sudo cp hospital-talagante.service /etc/systemd/system/

# Editar el archivo para poner rutas correctas
sudo nano /etc/systemd/system/hospital-talagante.service

# Habilitar auto-inicio
sudo systemctl daemon-reload
sudo systemctl enable hospital-talagante
sudo systemctl start hospital-talagante

# Ver estado
sudo systemctl status hospital-talagante
```

## 📂 Estructura del Proyecto
```
Proyecto/
├── backend/
│   ├── app/
│   │   ├── models/          # Modelos SQLAlchemy (tablas DB)
│   │   ├── routers/         # Endpoints FastAPI (API)
│   │   ├── schemas/         # Schemas Pydantic (validación)
│   │   ├── middleware/      # Autenticación JWT
│   │   ├── utils/           # Funciones auxiliares
│   │   ├── config.py        # Configuración general
│   │   ├── database.py      # Conexión a PostgreSQL
│   │   └── main.py          # Aplicación principal
│   ├── .env                 # Variables de entorno (CREAR)
│   ├── .env.example         # Plantilla de .env
│   ├── requirements.txt     # Dependencias Python
│   ├── start_server.bat     # Inicio rápido Windows
│   └── venv/                # Entorno virtual Python
├── frontend/
│   ├── src/
│   │   ├── api/             # Configuración Axios
│   │   ├── components/      # Componentes React reutilizables
│   │   ├── context/         # Context API (autenticación)
│   │   ├── pages/           # Páginas de la aplicación
│   │   ├── types/           # TypeScript interfaces
│   │   ├── utils/           # Funciones auxiliares
│   │   ├── App.tsx          # Componente principal
│   │   └── main.tsx         # Punto de entrada
│   ├── public/
│   │   ├── hospital-logo.svg # Logo del hospital
│   │   └── favicon.ico      # Ícono del navegador
│   ├── package.json         # Dependencias npm
│   ├── vite.config.ts       # Configuración Vite
│   └── start_frontend.bat   # Inicio rápido Windows
├── schema.sql               # Schema inicial de la base de datos
├── reset_database.sql       # Script para resetear BD
├── INICIAR_TODO.bat         # Inicio automático Windows
├── iniciar_todo.sh          # Inicio automático Linux/Mac
├── OBTENER_IP.bat           # Ver IP local Windows
├── obtener_ip.sh            # Ver IP local Linux/Mac
├── CONFIGURAR_FIREWALL.bat  # Abrir puertos Windows
├── hospital-talagante.service # Servicio systemd Linux
└── README.md                # Este archivo
```

## 📊 Funcionalidades del Sistema

### Roles de Usuario

**Administrador:**
- Acceso completo al sistema
- Crear/editar/eliminar cualquier examen
- Gestionar usuarios (crear Ingresadores)
- Ver todos los exámenes (incluidos suspendidos)
- Exportar a Excel
- Acceso a gráficos y estadísticas
- Importar respaldos desde Excel
- Suspender/reactivar exámenes de usuarios

**Ingresador:**
- Crear exámenes (TAC, RX, ECO)
- Editar solo sus propios exámenes
- Ver lista básica de exámenes
- Ver códigos MAI
- Sin acceso a administración ni gráficos

### Gráficos Disponibles

**Obligatorios (18):**
- Código × Atención (TAC/RX/ECO) - 3 gráficos
- Procedencia × Atención (TAC/RX/ECO) - 3 gráficos
- Código × Previsión (TAC/RX/ECO) - 3 gráficos
- Atención × Contrato (TAC/RX/ECO) - 3 gráficos
- Mes × Año (TAC/RX/ECO) - 3 gráficos
- Mes × Medio Contraste - Año Actual
- Mes × Año - Medio Contraste
- Mes × Tipo Examen - Año Actual

**Opcionales (15):**
- Código × Atención (periodo personalizado)
- Procedencia × Atención (periodo)
- Código × Previsión (periodo)
- Atención × Contrato (periodo)
- Mes × Atención × Año específico
- Mes × Medio Contraste × Año específico
- Mes × Atención × Contrato
- Mes × Tipo Examen × Año
- Mes × Atención × Personal (7 variantes: Médico, TM, TP, Secretaria, Realizado, Transcribe)

Todos los gráficos:
- Se muestran como gráficos de barras
- Incluyen tabla de datos
- Permiten ocultar/mostrar
- Se pueden exportar a Excel

### Exportación a Excel

**Exportar Exámenes:**
- Desde "Lista de Exámenes"
- Genera 3 hojas: TAC, RX, ECO
- Incluye TODAS las columnas
- Filtrable por mes/año específico
- Opción de aplicar filtros avanzados

**Exportar Gráficos:**
- Desde "Gráficos"
- Exporta todos los gráficos obligatorios
- Una hoja por gráfico
- Incluye fila y columna de TOTALES
- Meses mostrados como nombres

### Importar Respaldo

**Desde Administración:**
1. Click en "Importar Respaldo"
2. Seleccionar archivo Excel de exportación
3. El sistema:
   - Lee las 3 hojas (TAC, RX, ECO)
   - Verifica duplicados por ID
   - Solo importa exámenes nuevos
   - Crea pacientes si no existen
   - Relaciona con catálogos existentes
   - Muestra resumen: procesados, importados, duplicados, errores

**Casos de uso:**
- Migrar a nuevo servidor
- Recuperar después de fallo
- Consolidar datos de múltiples fuentes

## 🔄 Mantenimiento

### Resetear Base de Datos

**⚠️ ADVERTENCIA: Esto elimina TODOS los datos**
```bash
# Windows (pgAdmin):
# Query Tool → Abrir reset_database.sql → Ejecutar
# Query Tool → Abrir schema.sql → Ejecutar

# Linux/Mac:
sudo -u postgres psql -d hospital_talagante -f reset_database.sql
sudo -u postgres psql -d hospital_talagante -f schema.sql
```

Luego crear nuevo administrador.

### Backup de Base de Datos

**Backup manual:**
```bash
# Windows:
"C:\Program Files\PostgreSQL\14\bin\pg_dump.exe" -U postgres hospital_talagante > backup.sql

# Linux/Mac:
pg_dump -U postgres hospital_talagante > backup.sql
```

**Restaurar backup:**
```bash
# Windows:
"C:\Program Files\PostgreSQL\14\bin\psql.exe" -U postgres hospital_talagante < backup.sql

# Linux/Mac:
psql -U postgres hospital_talagante < backup.sql
```

**Backup automático (Linux):**

Crear cron job:
```bash
crontab -e

# Agregar línea (backup diario a las 2 AM):
0 2 * * * pg_dump -U postgres hospital_talagante > /ruta/backups/hospital_$(date +\%Y\%m\%d).sql
```

### Actualizar desde GitHub
```bash
cd Proyecto
git pull origin main

# Actualizar backend
cd backend
source venv/bin/activate  # o venv\Scripts\activate en Windows
pip install -r requirements.txt

# Actualizar frontend
cd ../frontend
npm install

# Reiniciar sistema
```

## 🐛 Solución de Problemas

### Error: "No se puede conectar a la base de datos"

**Verificar:**
1. PostgreSQL está corriendo:
   - Windows: Servicios → postgresql-x64-XX → Estado
   - Linux: `sudo systemctl status postgresql`
   - Mac: `brew services list`
2. Credenciales en `.env` son correctas
3. Base de datos `hospital_talagante` existe
4. Puerto 5432 no está bloqueado

**Solución:**
```bash
# Iniciar PostgreSQL
# Windows: Servicios → Iniciar
# Linux:
sudo systemctl start postgresql
# Mac:
brew services start postgresql
```

### Error: "CORS policy"

**Causa:** El frontend intenta acceder al backend desde una IP no permitida.

**Solución:**
1. Editar `backend/.env`
2. Agregar la IP a `CORS_ORIGINS`:
```env
CORS_ORIGINS=http://localhost:5173,http://192.168.1.X:5173
```
3. Reiniciar backend

### Error: "Port already in use"

**Puerto 8000 ocupado:**
```bash
# Cambiar puerto en comando de inicio:
uvicorn app.main:app --port 8001

# O encontrar y matar proceso:
# Windows:
netstat -ano | findstr :8000
taskkill /PID NUMERO_PID /F

# Linux/Mac:
lsof -i :8000
kill -9 PID
```

**Puerto 5173 ocupado:**
```bash
# Cambiar en vite.config.ts:
server: { port: 5174 }
```

### Error: "Module not found"

**Backend:**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt --force-reinstall
```

**Frontend:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Sistema lento o no responde

**Verificar recursos:**
- PostgreSQL consumiendo mucha RAM → Ajustar `shared_buffers` en `postgresql.conf`
- Muchos exámenes en BD → Ejecutar `VACUUM ANALYZE` en PostgreSQL
- Filtros muy amplios → Usar filtros más específicos

**Optimizar:**
```sql
-- En pgAdmin Query Tool:
VACUUM ANALYZE;
REINDEX DATABASE hospital_talagante;
```

### No puedo crear administrador

**Si olvidaste ADMIN_SECRET_KEY:**
1. Editar `backend/.env`
2. Cambiar `ADMIN_SECRET_KEY` por una nueva clave
3. Reiniciar backend
4. Usar la nueva clave para registrar admin

### Frontend no carga después de actualización
```bash
cd frontend
npm run build
rm -rf node_modules
npm install
npm run dev
```

## 🔒 Seguridad

### Recomendaciones

**Producción:**
- ✅ Cambiar `SECRET_KEY` a una clave aleatoria fuerte
- ✅ Usar HTTPS (certificado SSL)
- ✅ Configurar firewall correctamente
- ✅ Backups automáticos diarios
- ✅ Actualizar dependencias regularmente
- ✅ Logs de auditoría activados
- ✅ PostgreSQL con contraseña fuerte
- ✅ No compartir `.env` ni subirlo a Git

**Red Local:**
- ✅ Solo permitir IPs conocidas en CORS
- ✅ Red WiFi con WPA2/WPA3
- ✅ Firewall del servidor activo
- ✅ /docs bloqueado desde IPs externas

### Cambiar Contraseñas

**Usuario:**
- Desde "Perfil" → "Cambiar Contraseña"

**Admin Secret Key:**
1. Editar `backend/.env`
2. Cambiar `ADMIN_SECRET_KEY`
3. Comunicar nueva clave a administradores autorizados
4. Reiniciar backend

**PostgreSQL:**
```sql
ALTER USER postgres WITH PASSWORD 'nueva_contraseña_segura';
```
Luego actualizar `DATABASE_URL` en `.env`

## 📝 Personalización

### Cambiar Logo

1. Reemplazar `frontend/public/hospital-logo.svg`
2. Reemplazar `frontend/public/favicon.ico`
3. Refrescar navegador (Ctrl+F5)

### Cambiar Nombre

**Título del navegador:** `frontend/index.html`
```html
<title>Tu Hospital - Gestión de Exámenes</title>
```

**Nombre en interfaz:** `frontend/src/components/Layout.tsx`
```typescript
<h1 className="text-xl font-bold">Tu Hospital</h1>
```

### Cambiar Colores

**Tema principal:** `frontend/tailwind.config.js`
```javascript
theme: {
  extend: {
    colors: {
      primary: '#1e40af',  // Azul principal
      secondary: '#10b981', // Verde secundario
    }
  }
}
```

## 📄 Licencia

Este proyecto es de uso interno para Hospital Talagante.

## 🤝 Soporte

Para consultas técnicas o problemas:
- Email: soporte@hospital.cl
- Teléfono: +56 X XXXX XXXX

## 📌 Checklist de Instalación

Antes de usar en producción, verificar:

- [ ] PostgreSQL instalado y corriendo
- [ ] Base de datos creada y schema cargado
- [ ] Python 3.11+ instalado con PATH configurado
- [ ] Node.js 18+ instalado
- [ ] Archivo `.env` configurado correctamente
- [ ] SECRET_KEY cambiada (no usar la de ejemplo)
- [ ] Administrador inicial creado
- [ ] Firewall configurado (puertos 8000 y 5173)
- [ ] CORS configurado con IPs correctas
- [ ] Sistema inicia correctamente con script automático
- [ ] Acceso desde red local funciona
- [ ] Backup automático configurado
- [ ] Auto-inicio después de corte de luz configurado

## 🎯 Próximos Pasos

Después de la instalación:

1. **Crear usuarios Ingresadores** desde Administración
2. **Configurar catálogos** (Personal Médico, Protocolos, Diagnósticos)
3. **Cargar pacientes frecuentes** para autocomplete
4. **Probar desde dispositivos en red local**
5. **Configurar backups automáticos**
6. **Crear respaldo inicial** antes de uso intensivo
7. **Documentar ADMIN_SECRET_KEY** en lugar seguro
8. **Capacitar usuarios** en uso del sistema

---

**Versión:** 1.4.0  
**Última actualización:** Febrero 2026  
**Desarrollado para:** Hospital Talagante