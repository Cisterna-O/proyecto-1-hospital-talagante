from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime

class UsuarioBase(BaseModel):
    rut: str = Field(..., min_length=9, max_length=12)
    nombre: str = Field(..., min_length=3, max_length=150)
    email: EmailStr
    celular: Optional[str] = Field(None, max_length=20)
    rol: str = Field(..., pattern="^(ingresador|administrador)$")
    
    @validator('rut')
    def validar_formato_rut(cls, v):
        # Eliminar puntos y guión
        rut_limpio = v.replace(".", "").replace("-", "")
        if len(rut_limpio) < 8:
            raise ValueError('RUT debe tener al menos 8 caracteres')
        return rut_limpio

class UsuarioCreate(UsuarioBase):
    password: str = Field(..., min_length=6)

class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=3, max_length=150)
    email: Optional[EmailStr] = None
    celular: Optional[str] = Field(None, max_length=20)
    password: Optional[str] = Field(None, min_length=6)
    activo: Optional[bool] = None

class UsuarioResponse(UsuarioBase):
    id: int
    activo: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class UsuarioInDB(UsuarioResponse):
    password_hash: str