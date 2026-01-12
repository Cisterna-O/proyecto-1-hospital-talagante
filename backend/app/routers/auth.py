from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from pydantic import BaseModel, EmailStr, Field

from ..database import get_db
from ..models.usuario import Usuario
from ..schemas.auth import Token, LoginRequest, LoginResponse
from ..schemas.usuario import UsuarioCreate, UsuarioResponse
from ..utils.security import verify_password, get_password_hash, create_access_token
from ..utils.validators import validar_rut_chileno
from ..config import settings

router = APIRouter()

# ============================================
# SCHEMA PARA REGISTRO DE ADMIN
# ============================================

class RegistroAdminRequest(BaseModel):
    rut: str = Field(..., min_length=9, max_length=12)
    nombre: str = Field(..., min_length=3, max_length=150)
    email: EmailStr
    celular: str | None = Field(None, max_length=20)
    password: str = Field(..., min_length=6)
    admin_secret: str = Field(..., description="Clave secreta para crear admin")

# ============================================
# REGISTRO DE ADMIN (con clave secreta)
# ============================================

@router.post("/register-admin", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def registrar_admin(usuario_data: RegistroAdminRequest, db: Session = Depends(get_db)):
    """
    Registrar nuevo ADMINISTRADOR
    
    Requiere clave secreta que solo conocen los administradores actuales
    Esta clave se comparte en persona
    """
    
    # Verificar clave secreta
    if usuario_data.admin_secret != settings.ADMIN_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Clave secreta de administrador incorrecta"
        )
    
    # Validar RUT
    if not validar_rut_chileno(usuario_data.rut):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="RUT inválido"
        )
    
    # Verificar unicidad
    if db.query(Usuario).filter(Usuario.rut == usuario_data.rut).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="RUT ya registrado"
        )
    
    if db.query(Usuario).filter(Usuario.email == usuario_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email ya registrado"
        )
    
    # Crear admin
    nuevo_admin = Usuario(
        rut=usuario_data.rut,
        nombre=usuario_data.nombre,
        email=usuario_data.email,
        celular=usuario_data.celular,
        password_hash=get_password_hash(usuario_data.password),
        rol="administrador",
        debe_cambiar_password=False  # Admin elige su propia contraseña
    )
    
    db.add(nuevo_admin)
    db.commit()
    db.refresh(nuevo_admin)
    
    return nuevo_admin

# ============================================
# LOGIN
# ============================================

@router.post("/login", response_model=LoginResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Login de usuario
    
    Si es primer login (debe_cambiar_password=true), se indica en la respuesta
    """
    
    usuario = db.query(Usuario).filter(Usuario.email == login_data.email).first()
    
    if not usuario or not verify_password(login_data.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo. Contacta al administrador."
        )
    
    # Crear token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": usuario.id, "rol": usuario.rol},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "usuario": {
            "id": usuario.id,
            "nombre": usuario.nombre,
            "email": usuario.email,
            "rol": usuario.rol,
            "debe_cambiar_password": usuario.debe_cambiar_password  # ← NUEVO
        }
    }

# ============================================
# TOKEN (para Swagger /docs)
# ============================================

@router.post("/token", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login compatible con OAuth2 (para usar en /docs)
    """
    
    usuario = db.query(Usuario).filter(Usuario.email == form_data.username).first()
    
    if not usuario or not verify_password(form_data.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": usuario.id, "rol": usuario.rol},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}