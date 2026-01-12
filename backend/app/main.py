from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base

# Importar todos los modelos para crear tablas
from .models import (
    Usuario,
    Paciente,
    Prevision,
    Procedencia,
    CodigoMAI,
    ProtocoloTAC,
    Diagnostico,
    PersonalMedico,
    ExamenEspecifico,
    ExamenBase,
    ExamenTAC,
    ExamenRX,
    ExamenECO
)

# Importar routers
from .routers import auth, pacientes, catalogos, examenes, reportes, usuarios
# from .routers import examenes, usuarios, reportes  # Descomentar cuando los crees

# Crear tablas en la base de datos (en producción usar Alembic)
Base.metadata.create_all(bind=engine)

# Crear aplicación FastAPI
app = FastAPI(
    title="Sistema Hospital Talagante - Imagenología",
    description="API para gestión de exámenes TAC, RX y ECO",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ruta raíz
@app.get("/")
def root():
    return {
        "status": "OK",
        "message": "API Hospital Talagante - Imagenología",
        "version": "1.0.0",
        "docs": "/docs"
    }

# Health check
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "database": "connected"
    }

# Incluir routers
app.include_router(auth.router, prefix="/api/auth", tags=["Autenticación"])
app.include_router(pacientes.router, prefix="/api/pacientes", tags=["Pacientes"])
app.include_router(catalogos.router, prefix="/api/catalogos", tags=["Catálogos"])
app.include_router(examenes.router, prefix="/api/examenes", tags=["Exámenes"])
app.include_router(reportes.router, prefix="/api/reportes", tags=["Reportes"])
app.include_router(usuarios.router, prefix="/api/usuarios", tags=["Usuarios"])

# Descomentar cuando crees estos routers:
# app.include_router(examenes.router, prefix="/api/examenes", tags=["Exámenes"])
# app.include_router(usuarios.router, prefix="/api/usuarios", tags=["Usuarios"])
# app.include_router(reportes.router, prefix="/api/reportes", tags=["Reportes"])