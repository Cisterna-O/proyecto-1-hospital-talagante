from pydantic import BaseModel, Field, model_validator
from typing import Optional
from datetime import date, time, datetime

# ============================================
# EXAMEN BASE
# ============================================
class ExamenBaseData(BaseModel):
    """Datos comunes a todos los exámenes"""
    tipo_examen: str = Field(..., pattern="^(TAC|RX|ECO)$")
    fecha_realizacion: date
    atencion: str = Field(..., pattern="^(Abierta|Cerrada|Urgencia)$")
    prevision_id: int
    procedencia_id: int
    paciente_rut: str = Field(..., description="RUT del paciente (se buscará o creará)")
    paciente_nombre: Optional[str] = Field(None, description="Nombre si el paciente no existe")
    examen_especifico_id: int = Field(..., description="ID del examen específico (obligatorio)") 
    codigo_mai_id: int
    contrato: str = Field(..., pattern="^(Empresa Externa|Institucional)$")


class ExamenBaseResponse(BaseModel):
    id: int
    tipo_examen: str
    fecha_realizacion: date
    atencion: str
    mes_realizacion: int
    anio_realizacion: int
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

# ============================================
# EXAMEN TAC
# ============================================
class ExamenTACEspecifico(BaseModel):
    """Datos específicos de TAC"""
    fecha_solicitud: date
    hora_realizacion: time
    fecha_nacimiento: Optional[date] = None
    externo: Optional[str] = Field(None, max_length=50)
    protocolo_id: Optional[int] = None
    cod_acv: bool
    ges: bool
    medio_contraste: bool
    vfge: Optional[str] = Field(None, max_length=50)
    premedicado: Optional[bool] = None
    diagnostico_clinico_id: Optional[int] = None
    medico_solicitante_id: Optional[int] = None
    tm_id: Optional[int] = None
    tp_id: Optional[int] = None
    secretaria_id: Optional[int] = None
    observacion: Optional[str] = None

    @model_validator(mode="after")
    def validar_tac(self):
        # fecha_solicitud <= fecha_realizacion (heredada del base)
        if hasattr(self, "fecha_realizacion"):
            if self.fecha_solicitud > self.fecha_realizacion:
                raise ValueError(
                    "Fecha de solicitud no puede ser posterior a fecha de realización"
                )

        # VFGE → premedicado obligatorio
        if (
            self.vfge
            and self.vfge.lower() != "sin creatinina"
            and self.premedicado is None
        ):
            raise ValueError(
                "Premedicado es obligatorio cuando VFGE tiene un valor numérico"
            )

        return self


class ExamenTACCreate(ExamenBaseData, ExamenTACEspecifico):
    """Schema completo para crear TAC"""
    pass


class ExamenTACResponse(ExamenBaseResponse):
    fecha_solicitud: date
    hora_realizacion: time
    edad: Optional[int]
    cod_acv: bool
    ges: bool
    medio_contraste: bool
    observacion: Optional[str]

    model_config = {
        "from_attributes": True
    }

# ============================================
# EXAMEN RX
# ============================================
class ExamenRXEspecifico(BaseModel):
    """Datos específicos de RX"""
    hora_realizacion: time
    tm_tp_id: Optional[int] = None


class ExamenRXCreate(ExamenBaseData, ExamenRXEspecifico):
    """Schema completo para crear RX"""
    pass


class ExamenRXResponse(ExamenBaseResponse):
    hora_realizacion: time

    model_config = {
        "from_attributes": True
    }

# ============================================
# EXAMEN ECO
# ============================================
class ExamenECOEspecifico(BaseModel):
    """Datos específicos de ECO"""
    diagnostico_id: Optional[int] = None
    realizado_id: Optional[int] = None
    transcribe_id: Optional[int] = None


class ExamenECOCreate(ExamenBaseData, ExamenECOEspecifico):
    """Schema completo para crear ECO"""
    pass


class ExamenECOResponse(ExamenBaseResponse):
    model_config = {
        "from_attributes": True
    }

# ============================================
# SCHEMAS DE ACTUALIZACIÓN
# ============================================
class ExamenTACUpdate(BaseModel):
    # Datos base opcionales
    fecha_realizacion: Optional[date] = None
    atencion: Optional[str] = None
    prevision_id: Optional[int] = None
    procedencia_id: Optional[int] = None
    codigo_mai_id: Optional[int] = None
    contrato: Optional[str] = None

    # Datos TAC opcionales
    fecha_solicitud: Optional[date] = None
    hora_realizacion: Optional[time] = None
    fecha_nacimiento: Optional[date] = None
    externo: Optional[str] = None
    protocolo_id: Optional[int] = None
    cod_acv: Optional[bool] = None
    ges: Optional[bool] = None
    medio_contraste: Optional[bool] = None
    vfge: Optional[str] = None
    premedicado: Optional[bool] = None
    diagnostico_clinico_id: Optional[int] = None
    medico_solicitante_id: Optional[int] = None
    tm_id: Optional[int] = None
    tp_id: Optional[int] = None
    secretaria_id: Optional[int] = None
    observacion: Optional[str] = None


class ExamenRXUpdate(BaseModel):
    fecha_realizacion: Optional[date] = None
    atencion: Optional[str] = None
    prevision_id: Optional[int] = None
    procedencia_id: Optional[int] = None
    codigo_mai_id: Optional[int] = None
    contrato: Optional[str] = None

    hora_realizacion: Optional[time] = None
    tm_tp_id: Optional[int] = None


class ExamenECOUpdate(BaseModel):
    fecha_realizacion: Optional[date] = None
    atencion: Optional[str] = None
    prevision_id: Optional[int] = None
    procedencia_id: Optional[int] = None
    codigo_mai_id: Optional[int] = None
    contrato: Optional[str] = None

    diagnostico_id: Optional[int] = None
    realizado_id: Optional[int] = None
    transcribe_id: Optional[int] = None
