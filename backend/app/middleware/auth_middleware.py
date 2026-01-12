from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError
from ..database import get_db
from ..models.usuario import Usuario
from ..utils.security import decode_access_token
from ..schemas.auth import TokenData

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Usuario:
    """
    Obtener usuario actual desde token
    
    TODOS los endpoints protegidos usan esta función
    Si el token es inválido o el usuario está inactivo, lanza excepción
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    usuario_id: int = payload.get("sub")
    if usuario_id is None:
        raise credentials_exception
    
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if usuario is None:
        raise credentials_exception
    
    if not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo. Contacta al administrador."
        )
    
    return usuario

async def get_current_active_user(
    current_user: Usuario = Depends(get_current_user)
) -> Usuario:
    """
    Verificar que el usuario esté activo
    (Redundante con get_current_user pero útil para claridad)
    """
    if not current_user.activo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario inactivo"
        )
    return current_user

async def require_admin(
    current_user: Usuario = Depends(get_current_user)
) -> Usuario:
    """
    Requerir rol de administrador
    
    Lanza 403 si el usuario no es admin
    """
    if current_user.rol != "administrador":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos suficientes. Solo administradores."
        )
    return current_user

async def require_ingresador_o_admin(
    current_user: Usuario = Depends(get_current_user)
) -> Usuario:
    """
    Requerir rol de ingresador o administrador
    
    Para endpoints que ambos pueden acceder
    """
    if current_user.rol not in ["ingresador", "administrador"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos suficientes"
        )
    return current_user