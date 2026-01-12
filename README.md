# Sistema de Gestión - Hospital de Talagante
## Servicio de Imagenología

Sistema web para gestión de exámenes TAC, RX y ECO.

### 📋 Características

- ✅ Gestión de exámenes (TAC, RX, ECO)
- ✅ Sistema de usuarios (Admin/Ingresador)
- ✅ Reportería y estadísticas
- ✅ Exportación a Excel
- ✅ Control de acceso por roles

### 🛠️ Tecnologías

**Backend:**
- FastAPI (Python)
- PostgreSQL
- SQLAlchemy
- JWT Authentication

**Frontend:** (En desarrollo)
- React + TypeScript
- TailwindCSS

---

## 🚀 Instalación

### Requisitos Previos
- Python 3.10+
- PostgreSQL 13+
- Node.js 18+ (para frontend)

### Backend

1. **Clonar repositorio:**
```bash
git clone https://github.com/TU_USUARIO/hospital-talagante.git
cd hospital-talagante
```

2. **Configurar entorno virtual:**
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

3. **Instalar dependencias:**
```bash
pip install -r requirements.txt
```

4. **Configurar variables de entorno:**
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

5. **Crear base de datos:**
```bash
psql -U postgres -c "CREATE DATABASE hospital_talagante;"
psql -U postgres -d hospital_talagante -f database/schema.sql
```

6. **Ejecutar servidor:**
```bash
uvicorn app.main:app --reload --port 8000
```

7. **Acceder a documentación:**
```
http://localhost:8000/docs
```

---

## 👥 Equipo

- Tecnólogo Médico Mauricio Tello Reyes - Jefe Unidades Apoyo Clínico
- Tecnólogo Médico David Puyó Vera - Jefe Imagenología

---

## 📄 Licencia

Este proyecto es de uso interno del Hospital de Talagante.