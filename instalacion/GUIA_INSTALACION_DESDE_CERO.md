# 🚀 GUÍA DE INSTALACIÓN COMPLETA DESDE CERO

## 📋 Resumen Rápido

### ¿Qué debo instalar manualmente?
1. **Node.js** (incluye npm)
2. **Python** (incluye pip)
3. **PostgreSQL** (base de datos)
4. **Git** (control de versiones)

### ¿Qué hace el script automático?
- Crea la base de datos
- Instala dependencias de Python
- Instala dependencias de Node.js
- Configura todo y arranca el sistema

---

## 💻 INSTALACIÓN EN WINDOWS

### PASO 1: Instalar Node.js

#### 1.1. Descargar Node.js
1. Ir a: https://nodejs.org/
2. Descargar la versión **LTS** (recomendada) - botón verde grande
3. Esperar a que descargue (ej: `node-v20.11.0-x64.msi`)

#### 1.2. Instalar Node.js
1. **Hacer doble clic** en el archivo descargado
2. Clic en **"Next"** (Siguiente)
3. Aceptar licencia → **"Next"**
4. Dejar ruta por defecto → **"Next"**
5. Dejar todo marcado → **"Next"**
6. Marcar **"Automatically install necessary tools"** → **"Next"**
7. Clic en **"Install"**
8. Esperar a que termine
9. Clic en **"Finish"**

#### 1.3. Verificar Instalación
1. Presionar **Win + R**
2. Escribir: `cmd`
3. Presionar **Enter**
4. En la ventana negra, escribir:
   ```cmd
   node --version
   ```
5. Debe mostrar algo como: `v20.11.0`
6. Escribir:
   ```cmd
   npm --version
   ```
7. Debe mostrar algo como: `10.2.4`
8. Si muestra versiones, ✅ **Node.js instalado correctamente**
9. Cerrar la ventana

---

### PASO 2: Instalar Python

#### 2.1. Descargar Python
1. Ir a: https://www.python.org/
2. Clic en **"Downloads"**
3. Clic en **"Download Python 3.12.X"** (botón amarillo)
4. Esperar descarga (ej: `python-3.12.1-amd64.exe`)

#### 2.2. Instalar Python
1. **Hacer doble clic** en el archivo descargado
2. ⚠️ **MUY IMPORTANTE**: Marcar la casilla:
   ```
   ☑ Add python.exe to PATH
   ```
3. Clic en **"Install Now"**
4. Si pregunta permisos de administrador → **"Sí"**
5. Esperar a que termine
6. Clic en **"Close"**

#### 2.3. Verificar Instalación
1. Presionar **Win + R**
2. Escribir: `cmd`
3. Presionar **Enter**
4. Escribir:
   ```cmd
   python --version
   ```
5. Debe mostrar: `Python 3.12.X`
6. Escribir:
   ```cmd
   pip --version
   ```
7. Debe mostrar: `pip 24.X.X from ...`
8. Si muestra versiones, ✅ **Python instalado correctamente**
9. Cerrar la ventana

---

### PASO 3: Instalar PostgreSQL

#### 3.1. Descargar PostgreSQL
1. Ir a: https://www.postgresql.org/download/windows/
2. Clic en **"Download the installer"**
3. Clic en **"Windows x86-64"** de la versión más reciente (ej: 16.2)
4. Esperar descarga (ej: `postgresql-16.2-1-windows-x64.exe`)

#### 3.2. Instalar PostgreSQL
1. **Hacer doble clic** en el archivo descargado
2. Clic en **"Next"** (varias veces)
3. En **"Select Components"**, dejar todo marcado → **"Next"**
4. Dejar carpeta por defecto → **"Next"**
5. **IMPORTANTE - Contraseña**:
   - Ingresar una contraseña para el usuario `postgres`
   - **ANOTAR ESTA CONTRASEÑA** (la necesitarás después)
   - Ejemplo: `admin123` o `postgres2024`
   - Confirmar la contraseña
   - Clic en **"Next"**
6. Puerto: Dejar **5432** → **"Next"**
7. Locale: Dejar por defecto → **"Next"**
8. Resumen: Clic en **"Next"**
9. Clic en **"Next"** para instalar
10. Esperar (puede tardar 5-10 minutos)
11. **Desmarcar** "Launch Stack Builder" (no es necesario)
12. Clic en **"Finish"**

#### 3.3. Verificar Instalación
1. Presionar **Win + R**
2. Escribir: `cmd`
3. Presionar **Enter**
4. Escribir:
   ```cmd
   psql --version
   ```
5. Debe mostrar: `psql (PostgreSQL) 16.X`
6. Si muestra versión, ✅ **PostgreSQL instalado correctamente**
7. Cerrar la ventana

---

### PASO 4: Instalar Git

#### 4.1. Descargar Git
1. Ir a: https://git-scm.com/download/win
2. Descarga automática del instalador
3. Si no descarga, clic en **"Click here to download manually"**
4. Esperar descarga (ej: `Git-2.43.0-64-bit.exe`)

#### 4.2. Instalar Git
1. **Hacer doble clic** en el archivo descargado
2. Clic en **"Next"** (varias veces, dejar opciones por defecto)
3. En **"Choosing the default editor"**: 
   - Seleccionar **"Use Notepad as Git's default editor"**
   - O dejar la opción por defecto
   - Clic en **"Next"**
4. Seguir dando **"Next"** (dejar todo por defecto)
5. Clic en **"Install"**
6. Esperar
7. Clic en **"Finish"**

#### 4.3. Verificar Instalación
1. **Cerrar** todas las ventanas de CMD abiertas
2. Presionar **Win + R**
3. Escribir: `cmd`
4. Presionar **Enter**
5. Escribir:
   ```cmd
   git --version
   ```
6. Debe mostrar: `git version 2.43.X`
7. Si muestra versión, ✅ **Git instalado correctamente**
8. Cerrar la ventana

---

### PASO 5: Obtener el Código del Proyecto

#### Opción A: Si tienes el proyecto en GitHub

1. Presionar **Win + R**
2. Escribir: `cmd`
3. Presionar **Enter**
4. Ir a la carpeta donde quieres el proyecto:
   ```cmd
   cd C:\Users\TuUsuario\Desktop
   ```
5. Clonar el proyecto:
   ```cmd
   git clone https://github.com/usuario/hospital-talagante.git
   ```
6. Esperar a que descargue
7. Entrar a la carpeta:
   ```cmd
   cd hospital-talagante
   ```

#### Opción B: Si tienes el proyecto en un USB o carpeta compartida

1. **Copiar** la carpeta completa del proyecto
2. **Pegar** en tu computadora (ej: `C:\Users\TuUsuario\Desktop\hospital-talagante`)
3. Listo

---

### PASO 6: Configurar la Base de Datos

#### 6.1. Crear la Base de Datos

1. Presionar **Win + R**
2. Escribir: `cmd`
3. Presionar **Enter**
4. Conectarse a PostgreSQL (te pedirá la contraseña que anotaste):
   ```cmd
   psql -U postgres
   ```
5. Ingresar la contraseña cuando pregunte
6. Si conecta correctamente, verás: `postgres=#`
7. Crear la base de datos:
   ```sql
   CREATE DATABASE hospital_talagante;
   ```
8. Debe mostrar: `CREATE DATABASE`
9. Salir:
   ```sql
   \q
   ```

#### 6.2. Cargar el Schema (Estructura de Tablas)

1. En la misma ventana CMD, ir a la carpeta del proyecto:
   ```cmd
   cd C:\Users\TuUsuario\Desktop\hospital-talagante\Proyecto
   ```

2. **Windows PowerShell** (recomendado):
   - Presionar **Win + X**
   - Seleccionar **"Windows PowerShell"**
   - Ir a la carpeta del proyecto:
     ```powershell
     cd C:\Users\TuUsuario\Desktop\hospital-talagante\Proyecto
     ```
   - Cargar el schema con codificación correcta:
     ```powershell
     $env:PGCLIENTENCODING="UTF8"
     psql -U postgres -d hospital_talagante -f database/schema.sql
     ```
   - Ingresar contraseña de postgres
   - Esperar (verán muchas líneas de SQL ejecutándose)
   - Al final debe decir algo como: `INSERT 0 X` varias veces
   - ✅ Base de datos lista

---

### PASO 7: Configurar el Backend

#### 7.1. Configurar Variables de Entorno

1. Ir a la carpeta del proyecto en el Explorador de Archivos:
   ```
   C:\Users\TuUsuario\Desktop\hospital-talagante\Proyecto\backend
   ```

2. Buscar el archivo: **`.env.example`**

3. **Copiar** el archivo `.env.example`

4. **Pegar** en la misma carpeta

5. **Renombrar** la copia a: `.env` (sin el `.example`)
   - Si no ves las extensiones de archivos:
     - Clic en **"Ver"** en el explorador
     - Marcar **"Extensiones de nombre de archivo"**

6. **Hacer clic derecho** en `.env`

7. **"Abrir con"** → **"Bloc de notas"**

8. **Editar** las siguientes líneas:

   ```env
   # Cambiar TU_PASSWORD por la contraseña de postgres que anotaste
   DATABASE_URL=postgresql://postgres:admin123@localhost:5432/hospital_talagante
   
   # Dejar estas líneas como están por ahora (o generar claves seguras)
   SECRET_KEY=cambiar_esto_por_una_clave_muy_larga_y_segura_1234567890
   ADMIN_SECRET_KEY=cambiar_esto_por_otra_clave_secreta_para_admins_0987654321
   ```

9. **Guardar** el archivo (Ctrl + S)

10. **Cerrar** el Bloc de notas

#### 7.2. Generar Claves Seguras (Opcional pero Recomendado)

1. Presionar **Win + R**
2. Escribir: `cmd`
3. Presionar **Enter**
4. Escribir:
   ```cmd
   python
   ```
5. Se abre el intérprete de Python (`>>>`)
6. Escribir:
   ```python
   import secrets
   print(secrets.token_urlsafe(64))
   ```
7. Copiar el texto que aparece (ejemplo: `xK8mN...abc123`)
8. Pegar en el archivo `.env` en la línea `SECRET_KEY=`
9. Repetir pasos 6-7 para obtener otra clave
10. Pegar en `ADMIN_SECRET_KEY=`
11. Escribir:
    ```python
    exit()
    ```
12. Guardar el archivo `.env`

---

### PASO 8: ¡INICIAR EL SISTEMA AUTOMÁTICAMENTE!

#### 8.1. Usando el Script Automático (MÁS FÁCIL)

1. Ir a la carpeta del proyecto en el Explorador:
   ```
   C:\Users\TuUsuario\Desktop\hospital-talagante\Proyecto
   ```

2. Buscar el archivo: **`INICIAR_TODO.bat`**

3. **Hacer doble clic** en `INICIAR_TODO.bat`

4. Se abrirán **3 ventanas**:
   - Ventana 1: Script de inicio (se cierra sola)
   - Ventana 2: **Backend** (fondo azul oscuro)
   - Ventana 3: **Frontend** (comandos de Vite)

5. Esperar unos 10-30 segundos

6. El navegador se abrirá automáticamente en: `http://localhost:5173`

7. ✅ **¡Sistema funcionando!**

#### 8.2. Verificar que Todo Funciona

1. En el navegador deberías ver la página de **Login**
2. Si ves la página de login, ✅ **¡TODO FUNCIONA!**

---

### PASO 9: Crear el Primer Usuario Administrador

1. En la página de login, clic en **"¿No tienes cuenta? Regístrate como administrador"**

2. Llenar el formulario:
   - **RUT**: Tu RUT (ej: `12345678-9`)
   - **Nombre**: Tu nombre completo
   - **Email**: Tu correo
   - **Celular**: Tu celular (opcional)
   - **Contraseña**: Mínimo 8 caracteres
   - **Clave Secreta**: La que pusiste en `ADMIN_SECRET_KEY` del archivo `.env`

3. Clic en **"Registrarse"**

4. Te redirige al login

5. Hacer login con tu RUT y contraseña

6. ✅ **¡Estás dentro del sistema!**

---

### PASO 10: Detener el Sistema

Cuando termines de usar el sistema:

1. **Cerrar** las 2 ventanas que se abrieron (Backend y Frontend)
   - Ventana del Backend (fondo azul)
   - Ventana del Frontend (comandos de Vite)

2. O presionar **Ctrl + C** en cada ventana y luego cerrarlas

3. El sistema se detiene

---

### PASO 11: Iniciar el Sistema Nuevamente (Días Siguientes)

Para usar el sistema otro día:

1. Ir a: `C:\Users\TuUsuario\Desktop\hospital-talagante\Proyecto`

2. **Hacer doble clic** en `INICIAR_TODO.bat`

3. Esperar a que abra el navegador

4. ✅ **Listo para usar**

**No es necesario volver a instalar nada** (Node, Python, PostgreSQL, Git) - solo hacer doble clic en el `.bat`

---

## 🐧 INSTALACIÓN EN LINUX (Ubuntu/Debian)

### PASO 1: Instalar Node.js

```bash
# Actualizar repositorios
sudo apt update

# Instalar Node.js y npm
sudo apt install nodejs npm -y

# Verificar
node --version
npm --version
```

### PASO 2: Instalar Python

```bash
# Python ya viene instalado, pero verificar
python3 --version

# Instalar pip
sudo apt install python3-pip python3-venv -y

# Verificar
pip3 --version
```

### PASO 3: Instalar PostgreSQL

```bash
# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Iniciar servicio
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Crear usuario y base de datos
sudo -u postgres psql

# Dentro de psql:
CREATE DATABASE hospital_talagante;
\q
```

### PASO 4: Instalar Git

```bash
sudo apt install git -y
git --version
```

### PASO 5: Clonar Proyecto

```bash
cd ~
git clone https://github.com/usuario/hospital-talagante.git
cd hospital-talagante/Proyecto
```

### PASO 6: Cargar Schema

```bash
PGCLIENTENCODING=UTF8 psql -U postgres -d hospital_talagante -f database/schema.sql
```

### PASO 7: Configurar Backend

```bash
cd backend
cp .env.example .env
nano .env  # Editar con tus valores
```

### PASO 8: Iniciar Sistema

```bash
cd ~/hospital-talagante/Proyecto
chmod +x iniciar_todo.sh
./iniciar_todo.sh
```

---

## 🍎 INSTALACIÓN EN macOS

### PASO 1: Instalar Homebrew (si no lo tienes)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### PASO 2: Instalar Node.js

```bash
brew install node
node --version
npm --version
```

### PASO 3: Instalar Python

```bash
brew install python
python3 --version
pip3 --version
```

### PASO 4: Instalar PostgreSQL

```bash
brew install postgresql@16
brew services start postgresql@16

# Crear base de datos
psql postgres
CREATE DATABASE hospital_talagante;
\q
```

### PASO 5: Instalar Git

```bash
brew install git
git --version
```

### PASO 6-8: Igual que Linux

---

## ❓ PREGUNTAS FRECUENTES

### ¿Tengo que instalar todo cada vez que inicio el sistema?
**NO**. Solo instalas Node, Python, PostgreSQL y Git **UNA VEZ**. 

Después, solo haces **doble clic** en `INICIAR_TODO.bat` (Windows) o ejecutas `./iniciar_todo.sh` (Linux/Mac).

### ¿Qué hace exactamente el archivo INICIAR_TODO.bat?
1. Verifica que tengas Node, Python y PostgreSQL instalados
2. Verifica que la base de datos exista (si no, te pregunta si crearla)
3. Crea el entorno virtual de Python (carpeta `venv`)
4. Instala automáticamente las dependencias de Python (del `requirements.txt`)
5. Instala automáticamente las dependencias de Node (del `package.json`)
6. Inicia el servidor backend (Puerto 8000)
7. Inicia el servidor frontend (Puerto 5173)
8. Abre el navegador automáticamente

### ¿Puedo usar el sistema sin el script automático?
**Sí**, pero es más complicado. Debes abrir 2 terminales:

**Terminal 1 (Backend)**:
```cmd
cd C:\...\Proyecto\backend
venv\Scripts\activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 (Frontend)**:
```cmd
cd C:\...\Proyecto\frontend
npm run dev
```

### ¿Cómo sé si PostgreSQL está corriendo?

**Windows**:
```cmd
# Verificar servicio
sc query postgresql-x64-16

# Iniciar si está detenido
net start postgresql-x64-16
```

**Linux/Mac**:
```bash
# Verificar
sudo systemctl status postgresql

# Iniciar
sudo systemctl start postgresql
```

### ¿Puedo mover la carpeta del proyecto a otro lado?
**Sí**, puedes mover la carpeta `hospital-talagante` donde quieras. Solo asegúrate de hacer doble clic en el `INICIAR_TODO.bat` que está **dentro** de esa carpeta.

### Si cambio de computadora, ¿tengo que instalar todo de nuevo?
**Sí**, en la nueva computadora debes:
1. Instalar Node, Python, PostgreSQL, Git (PASO 1-4)
2. Copiar la carpeta del proyecto
3. Configurar `.env` con la contraseña de postgres de esa computadora
4. Ejecutar `INICIAR_TODO.bat`

### ¿Cómo actualizo el sistema cuando haya nuevas versiones?

**Si usas Git**:
```bash
cd Proyecto
git pull
```

**Si no usas Git**:
- Te enviarán los archivos actualizados
- Reemplazar los archivos viejos
- Ejecutar `INICIAR_TODO.bat` de nuevo

---

## 📞 Ayuda

Si tienes problemas:

1. Verificar que **todo** esté instalado (Node, Python, PostgreSQL, Git)
2. Verificar que PostgreSQL esté **corriendo**
3. Verificar que el archivo `.env` tenga la **contraseña correcta** de postgres
4. Reiniciar el computador y volver a intentar

---

## ✅ CHECKLIST FINAL

Antes de decir "ya está instalado", verifica:

- [ ] Node.js instalado (`node --version` funciona)
- [ ] Python instalado (`python --version` funciona)
- [ ] PostgreSQL instalado y corriendo (`psql --version` funciona)
- [ ] Git instalado (`git --version` funciona)
- [ ] Base de datos `hospital_talagante` creada
- [ ] Schema cargado en la base de datos
- [ ] Archivo `.env` configurado en `backend/`
- [ ] `INICIAR_TODO.bat` funciona y abre el navegador
- [ ] Puedes ver la página de login en `http://localhost:5173`
- [ ] Puedes registrar un administrador
- [ ] Puedes hacer login

Si **TODOS** están marcados, ✅ **¡Instalación completa exitosa!** 🎉
