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
- [Importación de Exámenes desde Excel](#-importación-de-exámenes-desde-excel)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Scripts Útiles](#-scripts-útiles)
- [Mantenimiento](#-mantenimiento)
- [Solución de Problemas](#-solución-de-problemas)

---

## 📖 Descripción General

Sistema web integral para la gestión de exámenes de imagenología en el Hospital de Talagante. Permite registrar, consultar, editar y generar reportes de exámenes TAC, RX y ECO, con gestión de usuarios, pacientes, catálogos y estadísticas completas.

### Tipos de Exámenes Soportados:
- **TAC** (Tomografía Axial Computarizada): 25 campos específicos
- **RX** (Radiografía): 11 campos específicos  
- **ECO** (Ecografía): 13 campos específicos

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
- **Importación masiva desde Excel** con validación automática

### 📊 Reportes y Estadísticas
- **18 gráficos obligatorios** (carga automática)
- **15 gráficos opcionales** personalizables
- **Exportación a Excel** con 3 hojas (TAC, RX, ECO)
- **Importación desde Excel** con detección de duplicados
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
- **pandas** - Procesamiento de datos Excel
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

## 📥 Importación de Exámenes desde Excel

### 🎯 Descripción General

El sistema permite importar exámenes masivamente desde archivos Excel, facilitando la migración de datos históricos o carga masiva de información. La importación incluye validación automática, detección de duplicados y reporte detallado de errores.

**Acceso**: Solo disponible para usuarios con rol **Administrador** desde la sección **Administración**.

---

### 📋 Plantilla de Excel

**Ubicación**: `Proyecto/plantilla/Plantilla-import-excel.xlsx`

La plantilla incluye 3 hojas con los nombres exactos de las columnas requeridas:

#### Hoja TAC (25 columnas):
```
Fecha Realización | Fecha Solicitud | Hora | Nombre | RUT | F/Nac | Edad | 
Previsión | Atención | Procedencia | Externo | Código | Examen | 
Cód.ACV | GES | M.Contraste | VFGE | Premedicado | Diagnóstico | 
Médico Sol. | TM | Contrato | TP | Secretaria | Observación
```

#### Hoja RX (11 columnas):
```
Fecha | Atención | Previsión | Procedencia | RUT | Nombre | 
Código | Examen | Hora | Realizado por | Contrato
```

#### Hoja ECO (13 columnas):
```
Fecha | Mes | RUT | Nombre | Atención | Previsión | Código | 
Examen | Diagnóstico | Procedencia | Realizado | Contrato | Transcribe
```

**⚠️ IMPORTANTE**: 
- NO incluir columnas "ID" ni "Creado el" (se generan automáticamente)
- Los nombres de columnas deben coincidir **exactamente** con la plantilla
- El Excel debe tener las 3 hojas, aunque estén vacías

---

### 🔍 Criterios de Importación

#### ✅ Exámenes que SE IMPORTAN:

Los exámenes se importan exitosamente cuando cumplen:
- ✅ Todos los campos obligatorios completos y válidos
- ✅ Valores correctos en campos predefinidos (Atención, Contrato)
- ✅ Códigos MAI que existen en el sistema
- ✅ RUT con formato válido chileno (`12345678-9`)
- ✅ Fechas y horas en formato correcto
- ✅ Booleanos con valores válidos (`Sí`, `No`, `S`, `N`, `1`, `0`)
- ✅ No es un duplicado (ver criterios abajo)

#### ❌ Exámenes que NO SE IMPORTAN (reportados como error):

**1. Campos Obligatorios Vacíos**:
- Fecha Realización vacía
- RUT vacío
- Nombre del paciente vacío
- Código MAI vacío
- Examen Específico vacío
- Atención vacía
- Hora vacía (para TAC y RX)
- Booleanos vacíos: Cód.ACV, GES, M.Contraste (en TAC)

**2. Valores Inválidos en Campos Predefinidos**:
- **Atención**: Solo acepta `Abierta`, `Cerrada` o `Urgencia`
  - ❌ Ejemplos inválidos: "Ambulatorio", "Externa", "Normal"
- **Contrato**: Solo acepta `Empresa Externa`, `Institucional` o vacío
  - ❌ Ejemplos inválidos: "Otro", "Particular", "Convenio"
- **Booleanos**: Solo acepta `Sí`, `Si`, `No`, `S`, `N`, `1`, `0`
  - ❌ Ejemplos inválidos: "true", "false", "X", vacío (en campos obligatorios)

**3. Códigos MAI No Existentes**:
- El código ingresado no existe en la base de datos
- Error reportado: `"Código MAI 'XXXXXX' no existe en el sistema"`
- **Acción requerida**: Verificar código en Códigos MAI o agregarlo primero

**4. Formato de Datos Incorrecto**:
- **Fechas inválidas**: 
  - ❌ `"45234.5"`, `"32/13/2025"`, `"texto"`
  - ✅ Correcto: `"2025-01-15"` o `"15/01/2025"`
- **Horas inválidas**: 
  - ❌ `"25:90:00"`, `"14:30"` (sin segundos), `"texto"`
  - ✅ Correcto: `"14:30:00"`
- **RUT inválido**: 
  - ❌ `"123456"` (sin guión), `"12-3456789"` (guión mal ubicado)
  - ✅ Correcto: `"12345678-9"`

**5. Validaciones Específicas TAC**:
- Fecha Solicitud posterior a Fecha Realización
  - Error: `"Fecha Solicitud no puede ser posterior a Fecha Realización"`
- VFGE con valor numérico pero campo Premedicado vacío
  - Error: `"Premedicado es obligatorio cuando VFGE tiene valor numérico"`

---

### 🔄 Detección de Duplicados

Un examen se considera **duplicado** si coinciden **TODOS** estos criterios:
- ✅ Mismo **tipo de examen** (TAC, RX o ECO)
- ✅ Misma **fecha de realización**
- ✅ Mismo **RUT de paciente**
- ✅ Mismo **código MAI**
- ✅ Mismo **examen específico**

**Acción con duplicados**: Se **omiten automáticamente** sin importar ni reportar como error.

**Ejemplo**:
```
Fila 5:  TAC | 2025-01-15 | 12345678-9 | 403001 | TAC CEREBRO → ✅ Se importa
Fila 10: TAC | 2025-01-15 | 12345678-9 | 403001 | TAC CEREBRO → ⏭️ Duplicado (se omite)
```

---

### 🆕 Creación Automática de Catálogos

El sistema **crea automáticamente** si no existen:
- ✅ **Previsiones** nuevas (ej: "ISAPRE COLMENA")
- ✅ **Procedencias** nuevas (ej: "NEUROLOGÍA INFANTIL")
- ✅ **Diagnósticos** nuevos (ej: "TRAUMATISMO CRANEAL LEVE")
- ✅ **Personal Médico** nuevo (ej: "Dr. Juan Silva")
  - Se crea con el tipo apropiado: TM, TP, MEDICO, SECRETARIA, GENERAL
- ✅ **Exámenes Específicos** nuevos (ej: "TAC DE CRÁNEO SIMPLE")
- ✅ **Pacientes** nuevos (si el RUT no existe)

**NO crea automáticamente** (reporta error):
- ❌ **Códigos MAI**: Deben existir previamente en el sistema
- ❌ **Valores de Atención**: Solo acepta los 3 predefinidos
- ❌ **Valores de Contrato**: Solo acepta los 2 predefinidos o vacío

---

### 📊 Proceso de Importación Paso a Paso

#### 1. Preparar el Archivo Excel

1. **Descargar plantilla**: `Proyecto/plantilla/Plantilla-import-excel.xlsx`
2. **Llenar datos** en las 3 hojas (TAC, RX, ECO según corresponda)
3. **Verificar**:
   - Nombres de columnas coinciden exactamente con la plantilla
   - Datos obligatorios completos
   - Códigos MAI existen en el sistema (verificar en Códigos MAI)
   - Formato de fechas: `YYYY-MM-DD` o `DD/MM/YYYY`
   - Formato de horas: `HH:MM:SS` (ej: `14:30:00`)
   - RUTs con formato: `12345678-9`
   - Atención: Solo `Abierta`, `Cerrada` o `Urgencia`
4. **Eliminar filas de ejemplo** de la plantilla

#### 2. Importar en el Sistema

1. Hacer login como **Administrador**
2. Ir a **Administración** (menú lateral)
3. Clic en botón **📥 Importar Excel**
4. Seleccionar el archivo `.xlsx` o `.xls`
5. Confirmar en el diálogo que aparece
6. **Esperar** mientras se procesa (puede tomar varios minutos)
   - No cerrar el navegador
   - No refrescar la página
   - Un indicador mostrará "⏳ Importando..."

#### 3. Revisar Resultados

Se mostrará un **modal** con el resumen completo:

```
✅ Importación Completada

📊 TAC
  Procesados: 150
  ✅ Importados: 120
  ⏭️ Duplicados: 25
  ❌ Errores: 5

📊 RX
  Procesados: 200
  ✅ Importados: 190
  ⏭️ Duplicados: 8
  ❌ Errores: 2

📊 ECO
  Procesados: 100
  ✅ Importados: 95
  ⏭️ Duplicados: 3
  ❌ Errores: 2

⚠️ Se encontraron errores en algunas filas
Se ha descargado automáticamente un archivo Excel 
con las filas que presentaron errores.

📈 Totales Generales
  Total Procesados: 450
  Total Importados: 405
  Total Duplicados: 36
  Total Errores: 9
```

---

### 📥 Excel de Errores

Cuando hay filas con errores, el sistema **descarga automáticamente** un archivo Excel llamado:

```
errores_importacion_YYYY-MM-DD.xlsx
```

**Ejemplo**: `errores_importacion_2026-02-12.xlsx`

#### Estructura del Excel de Errores:

| Columna | Descripción |
|---------|-------------|
| **FILA** | Número de fila en el Excel original (incluye header) |
| **ERROR** | Descripción detallada del problema encontrado |
| **Resto** | Todas las columnas originales con los datos ingresados |

#### Ejemplos de Mensajes de Error:

| FILA | ERROR | Fecha | RUT | Código | ... |
|------|-------|-------|-----|--------|-----|
| 5 | Código MAI '999999' no existe en el sistema | 2025-01-15 | 12345678-9 | 999999 | ... |
| 12 | Atención inválida. Debe ser: Abierta, Cerrada, Urgencia | 2025-01-16 | 98765432-1 | 403001 | ... |
| 28 | RUT inválido: 123456 | 2025-01-17 | 123456 | 403002 | ... |
| 35 | Hora Hora vacía | 2025-01-18 | 11111111-1 | 403003 | ... |
| 42 | Fecha Realización es obligatoria | | 22222222-2 | 403004 | ... |
| 56 | Cód.ACV inválido: debe ser Sí o No | 2025-01-20 | 33333333-3 | 403005 | ... |

**Características**:
- Filas con error marcadas visualmente (fondo rojo en columna ERROR)
- Datos originales preservados para fácil corrección
- Se puede corregir y volver a importar solo las filas con error

---

### 💡 Consejos y Buenas Prácticas

#### ✅ ANTES de Importar:

1. **Usar la plantilla oficial** de `Proyecto/plantilla/Plantilla-import-excel.xlsx`
2. **Verificar Códigos MAI primero**:
   - Ir a Códigos MAI en el sistema
   - Verificar que todos los códigos del Excel existen
   - Agregar códigos faltantes si es necesario
3. **Validar datos críticos**:
   - RUTs con formato `12345678-9`
   - Fechas `YYYY-MM-DD` o `DD/MM/YYYY`
   - Horas `HH:MM:SS` (ej: `14:30:00`)
4. **Revisar valores predefinidos**:
   - Atención: Solo `Abierta`, `Cerrada` o `Urgencia`
   - Contrato: Solo `Empresa Externa`, `Institucional` o vacío
5. **Probar con archivo pequeño primero** (10-20 filas)

#### ✅ DURANTE la Importación:

- ✅ Ser paciente (archivos grandes tardan varios minutos)
- ✅ No cerrar el navegador
- ✅ No refrescar la página
- ✅ Esperar el modal de resultados

#### ✅ DESPUÉS de la Importación:

1. **Revisar el modal de resultados** completamente
2. **Si hay errores**:
   - Descargar automáticamente el Excel de errores
   - Revisar columna "ERROR" para cada fila
   - Corregir datos en el Excel original
   - Re-importar solo las filas corregidas
3. **Verificar en Lista de Exámenes** que se importaron correctamente
4. **Revisar nuevos catálogos creados** (si aplica)

---

### 🐛 Solución de Problemas de Importación

#### Error: "Faltan hojas requeridas: TAC, RX, ECO"
**Causa**: El Excel no tiene las 3 hojas con nombres exactos  
**Solución**: Agregar las hojas faltantes. Pueden estar vacías pero deben existir.

#### Error: "Código MAI 'XXXXXX' no existe en el sistema"
**Causa**: El código no está registrado en la base de datos  
**Solución**: 
1. Ir a Códigos MAI y verificar si existe
2. Agregar el código al sistema, O
3. Corregir el código en el Excel

#### Error: "Atención inválida. Debe ser: Abierta, Cerrada, Urgencia"
**Causa**: Se usó un valor diferente (ej: "Ambulatorio")  
**Solución**: Cambiar a uno de los 3 valores exactos permitidos

#### Error: "RUT inválido: XXXXXX"
**Causa**: Formato incorrecto  
**Solución**: Usar formato `12345678-9` (con guión y dígito verificador)

#### Error: "Fecha inválida: XXXXX"
**Causa**: Excel interpretó mal la fecha o está mal formateada  
**Solución**: 
- Formatear columna como "Fecha" en Excel
- Usar formato `YYYY-MM-DD` (ej: `2025-01-15`)

#### Error: "Hora vacía" o "Hora inválida"
**Causa**: Celda vacía o formato incorrecto  
**Solución**: 
- Usar formato `HH:MM:SS` (ej: `14:30:00`)
- Incluir los segundos (`:00` al final)

#### Importación muy lenta (>5 minutos)
**Causa**: Archivo con muchas filas  
**Solución**: 
- Dividir en archivos más pequeños (<500 filas por hoja)
- Importar en horarios de menor uso del sistema
- Verificar conexión a internet

#### No se descarga el Excel de errores
**Causa**: Bloqueador de descargas del navegador  
**Solución**: 
- Permitir descargas automáticas en el navegador
- Revisar carpeta de Descargas
- Abrir consola del navegador (F12) para ver errores

#### Error de timeout / "La importación tomó demasiado tiempo"
**Causa**: Archivo demasiado grande (>1000 filas)  
**Solución**: Dividir el archivo en partes más pequeñas

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
│   │   ├── examen_especifico.py
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
│   ├── 📂 utils/                  # Utilidades
│   ├── database.py               # Conexión BD
│   ├── main.py                   # App principal
│   ├── requirements.txt          # Dependencias Python
│   └── .env.example              # Ejemplo configuración
│
├── 📂 frontend/                   # App React
│   ├── 📂 src/
│   │   ├── 📂 components/
│   │   ├── 📂 pages/
│   │   │   ├── Administracion.tsx  # ← Importación Excel aquí
│   │   │   └── ...
│   │   └── ...
│   └── ...
│
├── 📂 database/                   # Base de datos
│   ├── schema.sql                # Esquema completo
│   └── limpiar_tablas.sql        # Limpiar datos
│
├── 📂 plantilla/                  # 📥 PLANTILLAS
│   └── Plantilla-import-excel.xlsx # ← Plantilla oficial
│
├── 📂 scripts/                    # Scripts utilidad
│   ├── OBTENER_IP.bat
│   ├── obtener_ip.sh
│   ├── CONFIGURAR_FIREWALL.bat
│   └── hospital-talagante.service
│
├── .gitignore
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
| `scripts/OBTENER_IP.bat` | Muestra IP de red para acceso remoto |
| `scripts/CONFIGURAR_FIREWALL.bat` | Abre puertos 8000 y 5173 en firewall |

### Linux/Mac

| Script | Descripción |
|--------|-------------|
| `iniciar_todo.sh` | Inicia backend + frontend automáticamente |
| `scripts/obtener_ip.sh` | Muestra IP de red para acceso remoto |
| `scripts/hospital-talagante.service` | Servicio systemd (arranque automático) |

### Base de Datos

```bash
# Limpiar datos (mantiene estructura)
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
   scripts\CONFIGURAR_FIREWALL.bat
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
| POST | `/reportes/importar-excel` | **Importar desde Excel** |
| GET | `/graficos/*` | Gráficos estadísticos |

---

## 👥 Roles y Permisos

### Administrador
- ✅ Crear, editar, eliminar exámenes
- ✅ Gestionar usuarios
- ✅ Ver gráficos y reportes
- ✅ **Exportar/importar Excel**
- ✅ Suspender/reactivar exámenes
- ✅ Marcar exámenes en revisión

### Ingresador
- ✅ Crear exámenes
- ✅ Ver lista de exámenes
- ✅ Ver códigos MAI
- ❌ No puede editar/eliminar
- ❌ No puede ver gráficos
- ❌ **No puede importar Excel**
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

**Versión**: 2.0.0  
**Última actualización**: Febrero 2026  
**Desarrollado para**: Hospital de Talagante - Servicio de Imagenología

**Nuevas características v2.0**:
- ✅ Importación masiva de exámenes desde Excel
- ✅ Detección automática de duplicados
- ✅ Reporte de errores con descarga automática
- ✅ Creación automática de catálogos
- ✅ Validaciones robustas de datos
- ✅ Plantilla oficial con ejemplos