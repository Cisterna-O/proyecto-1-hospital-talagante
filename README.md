# 🏥 Sistema de Gestión de Exámenes - Hospital Talagante

Sistema completo de gestión de exámenes de imagenología (TAC, RX, ECO) para el Hospital de Talagante.

## 📋 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Características Principales](#-características-principales)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Scripts Útiles](#-scripts-útiles)
- [Mantenimiento](#-mantenimiento)
- [Solución de Problemas](#-solución-de-problemas)

---

## 📖 Descripción General

Sistema web integral para la gestión de exámenes de imagenología en el Hospital de Talagante. Permite registrar, consultar, editar y generar reportes de exámenes TAC, RX y ECO, con gestión de usuarios, pacientes, catálogos y estadísticas completas.

### Tipos de Exámenes Soportados:
- **TAC** (Tomografía Axial Computarizada): 27 campos específicos
- **RX** (Radiografía): 13 campos específicos  
- **ECO** (Ecografía): 14 campos específicos

---

## ✨ Características Principales

### 👥 Gestión de Usuarios
- Sistema de roles: **Administrador** e **Ingresador**
- Autenticación con JWT
- Cambio obligatorio de contraseña en primer login
- Registro de administradores con clave secreta

### 📝 Gestión de Exámenes
- Formularios específicos por tipo de examen (TAC/RX/ECO)
- Autocompletado de pacientes por RUT
- Autocompletado inteligente de formularios (últimos datos por usuario)
- Creación inline de catálogos
- Validaciones automáticas
- Soft delete (exámenes suspendidos)
- Sistema de revisión para administradores

### 📊 Reportes y Estadísticas
- **18 gráficos obligatorios** (carga automática)
- **15 gráficos opcionales** personalizables
- Exportación/importación Excel
- Filtros avanzados por fecha, atención, contrato, etc.
- Visualización con Chart.js

### 🗂️ Catálogos
- Previsiones (14 predefinidas)
- Procedencias (35 predefinidas)
- Códigos MAI por tipo (TAC: 28, RX: 23, ECO: 23)
- Exámenes específicos (TAC: ~150, RX: ~80, ECO: ~180)
- Diagnósticos
- Personal médico (TM, TP, Médicos, Secretarias)

---

## 🛠️ Tecnologías Utilizadas

### Backend
- **Python 3.11+**
- **FastAPI** - Framework web moderno y rápido
- **SQLAlchemy** - ORM para PostgreSQL
- **PostgreSQL** - Base de datos relacional
- **Pydantic** - Validación de datos
- **JWT** - Autenticación segura
- **bcrypt** - Hash de contraseñas
- **openpyxl** - Exportación/importación Excel

### Frontend
- **React 19** + **TypeScript**
- **Vite** - Build tool
- **React Router DOM 7** - Navegación
- **Axios** - Cliente HTTP
- **Tailwind CSS** - Estilos
- **Chart.js 4.5** - Gráficos

### Base de Datos
- **PostgreSQL 14+**
- Esquema normalizado con 12 tablas
- Índices optimizados
- Triggers automáticos
- Soft delete implementado

---

## 📦 Requisitos Previos

### Software Necesario:
- **Node.js 18+** ([Descargar](https://nodejs.org/))
- **Python 3.11+** ([Descargar](https://www.python.org/))
- **PostgreSQL 14+** ([Descargar](https://www.postgresql.org/))
- **Git** ([Descargar](https://git-scm.com/))

### Verificar Instalación:
```bash
node --version    # Debe ser 18+
python --version  # Debe ser 3.11+
psql --version    # Debe ser 14+
git --version
```

---

## 🚀 Instalación

### Opción 1: Instalación Automática (Recomendado)

#### Windows:
```batch
# Ejecutar como Administrador
INICIAR_TODO.bat
```

#### Linux/Mac:
```bash
chmod +x iniciar_todo.sh
./iniciar_todo.sh
```

Este script automáticamente:
1. ✅ Verifica requisitos
2. ✅ Crea la base de datos
3. ✅ Instala dependencias backend y frontend
4. ✅ Configura variables de entorno
5. ✅ Inicia el sistema completo

---

### Opción 2: Instalación Manual

#### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/hospital-talagante.git
cd hospital-talagante
```

#### 2. Configurar Base de Datos
```bash
# Conectarse a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE hospital_talagante;

# Salir
\q

# Cargar esquema con codificación UTF-8
# Windows PowerShell:
$env:PGCLIENTENCODING="UTF8"
psql -U postgres -d hospital_talagante -f database/schema.sql

# Linux/Mac:
PGCLIENTENCODING=UTF8 psql -U postgres -d hospital_talagante -f database/schema.sql

# Cargar códigos MAI (seeds)
psql -U postgres -d hospital_talagante -f database/seeds/codigos_tac.sql
psql -U postgres -d hospital_talagante -f database/seeds/codigos_rx.sql
psql -U postgres -d hospital_talagante -f database/seeds/codigos_eco.sql
```

#### 3. Configurar Backend
```bash
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

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores
```

#### 4. Configurar Frontend
```bash
cd ../frontend

# Instalar dependencias
npm install

# Configurar variables (opcional)
# Editar vite.config.ts si es necesario
```

---

## ⚙️ Configuración

### Variables de Entorno Backend (.env)

```env
# Base de Datos
DATABASE_URL=postgresql://postgres:tu_password@localhost:5432/hospital_talagante

# Seguridad
SECRET_KEY=tu_clave_secreta_muy_larga_y_segura_aqui
ADMIN_SECRET_KEY=clave_para_registrar_admins

# Configuración Adicional (opcional)
ACCESS_TOKEN_EXPIRE_MINUTES=30
TIMEZONE=America/Santiago
```

**Generar claves seguras**:
```python
import secrets
print(secrets.token_urlsafe(64))
```

### Configuración Frontend

El frontend se autoconfigura para:
- **Desarrollo**: `http://localhost:8000` (backend local)
- **Producción**: Detecta IP de red automáticamente

Para forzar una IP específica, editar `frontend/src/api/axios.ts`:
```typescript
const baseURL = 'http://192.168.1.100:8000';
```

---

## 🎯 Uso

### Iniciar el Sistema

#### Opción 1: Inicio Automático
```bash
# Windows:
INICIAR_TODO.bat

# Linux/Mac:
./iniciar_todo.sh
```

#### Opción 2: Inicio Manual

**Terminal 1 - Backend**:
```bash
cd backend
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

### Acceder al Sistema

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Documentación API**: http://localhost:8000/docs

### Primer Acceso

1. Ir a http://localhost:5173/registrar-admin
2. Ingresar:
   - RUT, nombre, email, celular
   - Contraseña (mínimo 8 caracteres)
   - Clave secreta (del .env: `ADMIN_SECRET_KEY`)
3. Hacer login con las credenciales creadas

---

## 📁 Estructura del Proyecto

```
Proyecto/
├── 📂 backend/                    # API FastAPI
│   ├── 📂 middleware/             # Autenticación JWT
│   ├── 📂 models/                 # Modelos SQLAlchemy
│   │   ├── usuario.py
│   │   ├── paciente.py
│   │   ├── examen_base.py
│   │   ├── examen_tac.py
│   │   ├── examen_rx.py
│   │   ├── examen_eco.py
│   │   └── catalogos.py
│   ├── 📂 routers/                # Endpoints REST
│   │   ├── auth.py               # Login/registro
│   │   ├── catalogos.py          # Catálogos
│   │   ├── examenes.py           # CRUD exámenes
│   │   ├── graficos.py           # Estadísticas
│   │   ├── pacientes.py          # Gestión pacientes
│   │   ├── reportes.py           # Excel export/import
│   │   └── usuarios.py           # Gestión usuarios
│   ├── 📂 schemas/                # Validación Pydantic
│   │   ├── catalogos.py
│   │   ├── examen.py
│   │   └── usuario.py
│   ├── 📂 utils/                  # Utilidades
│   │   ├── helpers.py            # RUT chileno, etc
│   │   ├── security.py           # JWT, bcrypt
│   │   ├── timezone.py           # Zona horaria Chile
│   │   └── validators.py         # Validadores custom
│   ├── database.py               # Conexión BD
│   ├── main.py                   # App principal
│   ├── requirements.txt          # Dependencias Python
│   ├── .env.example              # Ejemplo configuración
│   └── start_server.bat          # Script inicio Windows
│
├── 📂 frontend/                   # App React
│   ├── 📂 public/                # Archivos estáticos
│   ├── 📂 src/
│   │   ├── 📂 api/               # Cliente HTTP
│   │   │   └── axios.ts
│   │   ├── 📂 components/        # Componentes reutilizables
│   │   │   ├── Combobox.tsx
│   │   │   ├── PersonalCombobox.tsx
│   │   │   ├── FiltrosAvanzados.tsx
│   │   │   ├── FormularioTAC.tsx
│   │   │   ├── FormularioRX.tsx
│   │   │   ├── FormularioECO.tsx
│   │   │   ├── GraficoVisual.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── 📂 context/           # Estado global
│   │   │   └── AuthContext.tsx
│   │   ├── 📂 hooks/             # Hooks personalizados
│   │   │   └── useLastExamData.ts
│   │   ├── 📂 pages/             # Páginas/Rutas
│   │   │   ├── Login.tsx
│   │   │   ├── RegistrarAdmin.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── CrearExamen.tsx
│   │   │   ├── EditarExamen.tsx
│   │   │   ├── ListaExamenes.tsx
│   │   │   ├── Graficos.tsx
│   │   │   ├── Codigos.tsx
│   │   │   ├── Administracion.tsx
│   │   │   └── Perfil.tsx
│   │   ├── 📂 types/             # Tipos TypeScript
│   │   │   ├── index.ts
│   │   │   └── filtros.ts
│   │   ├── 📂 utils/             # Utilidades
│   │   │   └── formatters.ts
│   │   ├── App.tsx               # App principal
│   │   ├── main.tsx              # Punto entrada
│   │   └── index.css             # Estilos Tailwind
│   ├── package.json              # Dependencias Node
│   ├── vite.config.ts            # Configuración Vite
│   ├── tailwind.config.js        # Configuración Tailwind
│   ├── tsconfig.json             # Configuración TypeScript
│   └── start_frontend.bat        # Script inicio Windows
│
├── 📂 database/                   # Base de datos
│   ├── schema.sql                # Esquema completo
│   ├── 📂 seeds/                 # Datos iniciales
│   │   ├── codigos_tac.sql
│   │   ├── codigos_rx.sql
│   │   └── codigos_eco.sql
│   ├── reset_database.sql        # Resetear BD
│   └── limpiar_tablas.sql        # Limpiar datos
│
├── 📂 scripts/                    # Scripts utilidad
│   ├── OBTENER_IP.bat            # Obtener IP red (Windows)
│   ├── obtener_ip.sh             # Obtener IP red (Linux)
│   ├── CONFIGURAR_FIREWALL.bat   # Abrir puertos (Windows)
│   └── hospital-talagante.service # Servicio systemd (Linux)
│
├── .gitignore                    # Archivos ignorados Git
├── INICIAR_TODO.bat              # Inicio completo (Windows)
├── iniciar_todo.sh               # Inicio completo (Linux/Mac)
└── README.md                     # Este archivo
```

---

## 🔧 Scripts Útiles

### Windows

| Script | Descripción |
|--------|-------------|
| `INICIAR_TODO.bat` | Inicia backend + frontend automáticamente |
| `backend/start_server.bat` | Solo backend |
| `frontend/start_frontend.bat` | Solo frontend |
| `OBTENER_IP.bat` | Muestra IP de red para acceso remoto |
| `CONFIGURAR_FIREWALL.bat` | Abre puertos 8000 y 5173 en firewall |

### Linux/Mac

| Script | Descripción |
|--------|-------------|
| `iniciar_todo.sh` | Inicia backend + frontend automáticamente |
| `scripts/obtener_ip.sh` | Muestra IP de red para acceso remoto |
| `scripts/hospital-talagante.service` | Servicio systemd (arranque automático) |

### Base de Datos

```bash
# Resetear BD completa (elimina y recrea)
psql -U postgres -d hospital_talagante -f database/reset_database.sql

# Solo limpiar datos (mantiene estructura)
$env:PGCLIENTENCODING="UTF8"  # Windows
psql -U postgres -d hospital_talagante -f database/limpiar_tablas.sql

# Recargar schema
$env:PGCLIENTENCODING="UTF8"  # Windows
psql -U postgres -d hospital_talagante -f database/schema.sql
```

---

## 🔄 Mantenimiento

### Backup de Base de Datos
```bash
# Crear backup
pg_dump -U postgres hospital_talagante > backup_$(date +%Y%m%d).sql

# Restaurar backup
psql -U postgres -d hospital_talagante < backup_20260209.sql
```

### Actualizar Dependencias

**Backend**:
```bash
cd backend
pip install --upgrade -r requirements.txt
```

**Frontend**:
```bash
cd frontend
npm update
```

### Logs

**Backend**: Los logs se muestran en la terminal donde se ejecuta uvicorn

**Frontend**: Los logs se muestran en la consola del navegador (F12)

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to database"
**Causa**: PostgreSQL no está corriendo o credenciales incorrectas
**Solución**:
```bash
# Windows:
net start postgresql-x64-14

# Linux:
sudo systemctl start postgresql

# Verificar conexión:
psql -U postgres -d hospital_talagante
```

### Error: "Port 8000 already in use"
**Causa**: El puerto ya está ocupado
**Solución**:
```bash
# Windows - Matar proceso en puerto 8000:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux:
lsof -ti:8000 | xargs kill -9
```

### Error: "Module not found"
**Causa**: Dependencias no instaladas
**Solución**:
```bash
# Backend:
cd backend
pip install -r requirements.txt

# Frontend:
cd frontend
npm install
```

### Error de Codificación en schema.sql
**Solución**:
```powershell
# Windows PowerShell:
$env:PGCLIENTENCODING="UTF8"
psql -U postgres -d hospital_talagante -f database/schema.sql
```

### No puedo acceder desde otro dispositivo
**Solución**:
1. Obtener IP del servidor:
   ```bash
   # Windows:
   ipconfig
   # Linux:
   ip addr
   ```
2. Configurar firewall (Windows):
   ```bash
   CONFIGURAR_FIREWALL.bat
   ```
3. Acceder desde otro dispositivo:
   ```
   http://IP_DEL_SERVIDOR:5173
   ```

---

## 📚 Documentación Adicional

### API REST
- Documentación interactiva: http://localhost:8000/docs
- Especificación OpenAPI: http://localhost:8000/openapi.json

### Endpoints Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/login` | Login de usuario |
| POST | `/auth/register-admin` | Registrar administrador |
| GET | `/examenes/tac/completo` | Listar exámenes TAC |
| POST | `/examenes/tac` | Crear examen TAC |
| PUT | `/examenes/tac/{id}` | Actualizar examen TAC |
| DELETE | `/examenes/tac/{id}` | Eliminar examen TAC |
| GET | `/reportes/exportar-excel` | Exportar a Excel |
| GET | `/graficos/*` | Gráficos estadísticos |

---

## 👥 Roles y Permisos

### Administrador
- ✅ Crear, editar, eliminar exámenes
- ✅ Gestionar usuarios
- ✅ Ver gráficos y reportes
- ✅ Exportar/importar Excel
- ✅ Suspender/reactivar exámenes
- ✅ Marcar exámenes en revisión

### Ingresador
- ✅ Crear exámenes
- ✅ Ver lista de exámenes
- ✅ Ver códigos MAI
- ❌ No puede editar/eliminar
- ❌ No puede ver gráficos
- ❌ No puede gestionar usuarios

---

## 📄 Licencia

Este proyecto es de uso interno del Hospital de Talagante.

---

## 🤝 Contribuir

Para reportar bugs o sugerir mejoras:
1. Crear un issue en el repositorio
2. Describir el problema o mejora
3. Incluir capturas de pantalla si aplica

---

## 📞 Soporte

Para soporte técnico, contactar al equipo de TI del Hospital de Talagante, o al desarrollador de la API.

---

**Versión**: 1.5.0  
**Última actualización**: Febrero 2026  
**Desarrollado para**: Hospital de Talagante - Servicio de Imagenología
