from pydantic import BaseModel, Field
from typing import Optional

# Base genérico para catálogos simples
class CatalogoBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=150)

class CatalogoCreate(CatalogoBase):
    pass

class CatalogoResponse(CatalogoBase):
    id: int
    activo: bool
    
    class Config:
        from_attributes = True

# Prevision
class PrevisionResponse(CatalogoResponse):
    pass

# Procedencia
class ProcedenciaCreate(CatalogoBase):
    pass

class ProcedenciaResponse(CatalogoResponse):
    pass

# Código MAI
class CodigoMAIBase(BaseModel):
    tipo_examen: str = Field(..., pattern="^(TAC|RX|ECO)$")
    codigo: str = Field(..., max_length=20)
    descripcion: str

class CodigoMAICreate(CodigoMAIBase):
    pass

class CodigoMAIResponse(CodigoMAIBase):
    id: int
    activo: bool
    
    class Config:
        from_attributes = True

# Protocolo TAC
class ProtocoloTACCreate(CatalogoBase):
    pass

class ProtocoloTACResponse(CatalogoResponse):
    pass

# Diagnóstico
class DiagnosticoCreate(BaseModel):
    nombre: str = Field(..., min_length=1)

class DiagnosticoResponse(BaseModel):
    id: int
    nombre: str
    activo: bool
    
    class Config:
        from_attributes = True

# Personal Médico
class PersonalMedicoBase(BaseModel):
    nombre: str = Field(..., min_length=3, max_length=150)
    tipo: str = Field(..., pattern="^(TM|TP|MEDICO|SECRETARIA|GENERAL)$")

class PersonalMedicoCreate(PersonalMedicoBase):
    pass

class PersonalMedicoResponse(PersonalMedicoBase):
    id: int
    activo: bool
    
    class Config:
        from_attributes = True

# Examen Específico
class ExamenEspecificoBase(BaseModel):
    tipo_examen: str = Field(..., pattern="^(TAC|RX|ECO)$")
    nombre: str = Field(..., min_length=3, max_length=200)

class ExamenEspecificoCreate(ExamenEspecificoBase):
    pass

class ExamenEspecificoResponse(ExamenEspecificoBase):
    id: int
    activo: bool
    
    class Config:
        from_attributes = True