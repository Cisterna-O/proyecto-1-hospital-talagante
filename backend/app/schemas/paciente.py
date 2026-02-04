from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import date, datetime

class PacienteBase(BaseModel):
    rut: str = Field(..., min_length=9, max_length=12)
    tipo_identificacion: str = Field(default="RUT_CHILENO", pattern="^(RUT_CHILENO|RUT_EXTRANJERO|PASAPORTE|OTRO)$")
    nombre_completo: str = Field(..., min_length=3, max_length=200)
    fecha_nacimiento: Optional[date] = None
    
    @validator('rut')
    def validar_formato_rut(cls, v):
        rut_limpio = v.replace(".", "").replace("-", "")
        if len(rut_limpio) < 8:
            raise ValueError('RUT debe tener al menos 8 caracteres')
        return rut_limpio

class PacienteCreate(PacienteBase):
    pass

class PacienteUpdate(BaseModel):
    nombre_completo: Optional[str] = Field(None, min_length=3, max_length=200)
    fecha_nacimiento: Optional[date] = None

class PacienteResponse(PacienteBase):
    id: int
    created_at: datetime
    edad: Optional[int] = None
    
    class Config:
        from_attributes = True

class PacienteAutocomplete(BaseModel):
    """Schema para autocomplete de pacientes por RUT"""
    rut: str
    nombre_completo: str
    fecha_nacimiento: Optional[date]
    edad: Optional[int] = None
    
    class Config:
        from_attributes = True