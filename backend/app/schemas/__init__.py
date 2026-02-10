from .usuario import (
    UsuarioCreate,
    UsuarioUpdate,
    UsuarioResponse,
    UsuarioInDB
)
from .paciente import (
    PacienteCreate,
    PacienteUpdate,
    PacienteResponse,
    PacienteAutocomplete
)
from .catalogos import (
    PrevisionCreate,
    PrevisionResponse,
    ProcedenciaCreate,
    ProcedenciaResponse,
    CodigoMAICreate,
    CodigoMAIResponse,
#    ProtocoloTACCreate,
#    ProtocoloTACResponse,
    DiagnosticoCreate,
    DiagnosticoResponse,
    PersonalMedicoCreate,
    PersonalMedicoResponse
)
from .examen import (
    ExamenTACCreate,
    ExamenTACUpdate,
    ExamenTACResponse,
    ExamenRXCreate,
    ExamenRXUpdate,
    ExamenRXResponse,
    ExamenECOCreate,
    ExamenECOUpdate,
    ExamenECOResponse,
    ExamenTACCompleto,
    ExamenRXCompleto,
    ExamenECOCompleto
)
from .auth import (
    Token,
    TokenData,
    LoginRequest,
    LoginResponse
)

__all__ = [
    # Usuario
    "UsuarioCreate",
    "UsuarioUpdate",
    "UsuarioResponse",
    "UsuarioInDB",
    # Paciente
    "PacienteCreate",
    "PacienteUpdate",
    "PacienteResponse",
    "PacienteAutocomplete",
    # Catálogos
    "PrevisionCreate",
    "PrevisionResponse",
    "ProcedenciaCreate",
    "ProcedenciaResponse",
    "CodigoMAICreate",
    "CodigoMAIResponse",
#    "ProtocoloTACCreate",
#    "ProtocoloTACResponse",
    "DiagnosticoCreate",
    "DiagnosticoResponse",
    "PersonalMedicoCreate",
    "PersonalMedicoResponse",
    # Exámenes
    "ExamenTACCreate",
    "ExamenTACUpdate",
    "ExamenTACResponse",
    "ExamenRXCreate",
    "ExamenRXUpdate",
    "ExamenRXResponse",
    "ExamenECOCreate",
    "ExamenECOUpdate",
    "ExamenECOResponse",
    # Auth
    "Token",
    "TokenData",
    "LoginRequest",
    "LoginResponse",
    # ExamenEspecifico
    "ExamenEspecificoCreate",
    "ExamenEspecificoResponse",
    "ExamenTACCompleto",
    "ExamenRXCompleto",
    "ExamenECOCompleto",
]