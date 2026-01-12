from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field

from ..database import get_db
from ..models.usuario import Usuario
from ..models.examen_base import ExamenBase
from ..schemas.usuario import UsuarioResponse, UsuarioUpdate, UsuarioCreate
from ..middleware.auth_middleware import get_current_user, require_admin
from ..utils.security import verify_password, get_password_hash
from ..utils.validators import validar_rut_chileno
from ..utils.helpers import limpiar_rut

router = APIRouter()

# ============================================
# SCHEMAS ADICIONALES
# ============================================

class CambiarPasswordRequest(BaseModel):
    password_actual: str = Field(..., min_length=6)
    password_nueva: str = Field(..., min_length=6)

class PrimerLoginPasswordRequest(BaseModel):
    password_nueva: str = Field(..., min_length=6)

# ============================================
# PERFIL PROPIO
# ============================================

@router.get("/me", response_model=UsuarioResponse)
def obtener_mi_perfil(current_user: Usuario = Depends(get_current_user)):
    """Ver mi perfil"""
    return current_user

@router.put("/me", response_model=UsuarioResponse)
def actualizar_mi_perfil(
    datos: UsuarioUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Actualizar mi perfil (nombre, email, celular)
    """
    
    # Validar email único
    if datos.email and datos.email != current_user.email:
        if db.query(Usuario).filter(Usuario.email == datos.email, Usuario.id != current_user.id).first():
            raise HTTPException(status_code=400, detail="Email ya en uso")
    
    if datos.nombre:
        current_user.nombre = datos.nombre
    if datos.email:
        current_user.email = datos.email
    if datos.celular is not None:
        current_user.celular = datos.celular
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/me/primer-cambio-password")
def primer_cambio_password(
    datos: PrimerLoginPasswordRequest,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Cambiar contraseña en primer login (cuando debe_cambiar_password=true)
    """
    
    if not current_user.debe_cambiar_password:
        raise HTTPException(status_code=400, detail="No necesitas cambiar contraseña")
    
    current_user.password_hash = get_password_hash(datos.password_nueva)
    current_user.debe_cambiar_password = False
    db.commit()
    
    return {"message": "Contraseña actualizada. Ya puedes usar el sistema."}

@router.post("/me/cambiar-password")
def cambiar_mi_password(
    datos: CambiarPasswordRequest,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Cambiar mi contraseña (requiere contraseña actual)"""
    
    if not verify_password(datos.password_actual, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Contraseña actual incorrecta")
    
    if datos.password_actual == datos.password_nueva:
        raise HTTPException(status_code=400, detail="Nueva contraseña debe ser diferente")
    
    current_user.password_hash = get_password_hash(datos.password_nueva)
    db.commit()
    
    return {"message": "Contraseña actualizada exitosamente"}

@router.delete("/me", status_code=204)
def eliminar_mi_cuenta(
    password: str = Query(..., min_length=6),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Eliminar mi propia cuenta (requiere confirmar contraseña)
    
    Solo se permite si NO has creado exámenes
    """
    
    if not verify_password(password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Contraseña incorrecta")
    
    # Verificar que no tenga exámenes
    examenes_count = db.query(ExamenBase).filter(ExamenBase.created_by == current_user.id).count()
    if examenes_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"No puedes eliminar tu cuenta. Tienes {examenes_count} exámenes registrados. Contacta al administrador."
        )
    
    db.delete(current_user)
    db.commit()
    return None

# ============================================
# ADMIN: CREAR USUARIOS INGRESADORES
# ============================================

@router.post("/", response_model=UsuarioResponse, status_code=201)
def crear_usuario_ingresador(
    usuario_data: UsuarioCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """
    Crear nuevo usuario INGRESADOR (solo admin)
    
    Se crea con contraseña temporal que debe cambiar en primer login
    """
    
    if not validar_rut_chileno(usuario_data.rut):
        raise HTTPException(status_code=400, detail="RUT inválido")
    
    if db.query(Usuario).filter(Usuario.rut == usuario_data.rut).first():
        raise HTTPException(status_code=400, detail="RUT ya registrado")
    
    if db.query(Usuario).filter(Usuario.email == usuario_data.email).first():
        raise HTTPException(status_code=400, detail="Email ya registrado")
    
    # Forzar rol ingresador (admin no puede crear otros admin desde aquí)
    nuevo_usuario = Usuario(
        rut=usuario_data.rut,
        nombre=usuario_data.nombre,
        email=usuario_data.email,
        celular=usuario_data.celular,
        password_hash=get_password_hash(usuario_data.password),
        rol="ingresador",  # ← Siempre ingresador
        debe_cambiar_password=True  # ← Debe cambiar en primer login
    )
    
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    
    return nuevo_usuario

# ============================================
# ADMIN: GESTIÓN DE USUARIOS
# ============================================

@router.get("/", response_model=List[UsuarioResponse])
def listar_usuarios(
    skip: int = 0,
    limit: int = 100,
    activo: Optional[bool] = None,
    rol: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Listar usuarios (solo admin)"""
    
    query = db.query(Usuario)
    
    if activo is not None:
        query = query.filter(Usuario.activo == activo)
    if rol:
        query = query.filter(Usuario.rol == rol)
    if search:
        term = f"%{search}%"
        query = query.filter(
            (Usuario.nombre.ilike(term)) | (Usuario.email.ilike(term)) | (Usuario.rut.ilike(term))
        )
    
    return query.order_by(Usuario.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/{usuario_id}/examenes")
def obtener_examenes_usuario(
    usuario_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Ver todos los exámenes creados por un usuario (solo admin)"""
    
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    examenes = db.query(ExamenBase).filter(
        ExamenBase.created_by == usuario_id,
        ExamenBase.deleted_at.is_(None)
    ).order_by(ExamenBase.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "usuario": {"id": usuario.id, "nombre": usuario.nombre, "rol": usuario.rol},
        "total": len(examenes),
        "examenes": [{"id": e.id, "tipo": e.tipo_examen, "fecha": e.fecha_realizacion} for e in examenes]
    }

@router.patch("/{usuario_id}/toggle", response_model=UsuarioResponse)
def toggle_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """Activar/desactivar usuario (solo admin)"""
    
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if usuario.id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes desactivarte a ti mismo")
    
    usuario.activo = not usuario.activo
    db.commit()
    db.refresh(usuario)
    return usuario

@router.delete("/{usuario_id}", status_code=204)
def eliminar_usuario(
    usuario_id: int,
    eliminar_examenes: bool = False,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """
    Eliminar usuario (solo admin)
    
    eliminar_examenes=true: elimina también todos sus exámenes (soft delete)
    """
    
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if usuario.id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes eliminarte a ti mismo")
    
    examenes_count = db.query(ExamenBase).filter(ExamenBase.created_by == usuario_id).count()
    
    if examenes_count > 0 and not eliminar_examenes:
        raise HTTPException(
            status_code=400,
            detail=f"Usuario tiene {examenes_count} exámenes. Usa eliminar_examenes=true o desactiva el usuario."
        )
    
    if eliminar_examenes:
        from datetime import datetime
        db.query(ExamenBase).filter(ExamenBase.created_by == usuario_id).update({"deleted_at": datetime.utcnow()})
    
    db.delete(usuario)
    db.commit()
    return None