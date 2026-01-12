from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models.catalogos import (
    Prevision,
    Procedencia,
    CodigoMAI,
    ProtocoloTAC,
    Diagnostico,
    PersonalMedico
)
from ..models.usuario import Usuario
from ..schemas.catalogos import (
    PrevisionResponse,
    ProcedenciaCreate,
    ProcedenciaResponse,
    CodigoMAICreate,
    CodigoMAIResponse,
    ProtocoloTACCreate,
    ProtocoloTACResponse,
    DiagnosticoCreate,
    DiagnosticoResponse,
    PersonalMedicoCreate,
    PersonalMedicoResponse
)
from ..middleware.auth_middleware import get_current_user, require_admin

from ..models.examen_especifico import ExamenEspecifico
from ..schemas.catalogos import (
    # ... todos los anteriores ...
    ExamenEspecificoCreate,
    ExamenEspecificoResponse
)

router = APIRouter()

# ============================================
# PREVISIONES
# ============================================
@router.get("/previsiones", response_model=List[PrevisionResponse])
def listar_previsiones(
    activo: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Listar todas las previsiones"""
    query = db.query(Prevision)
    
    if activo is not None:
        query = query.filter(Prevision.activo == activo)
    
    return query.all()

# ============================================
# PROCEDENCIAS
# ============================================
@router.get("/procedencias", response_model=List[ProcedenciaResponse])
def listar_procedencias(
    activo: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Listar todas las procedencias"""
    query = db.query(Procedencia)
    
    if activo is not None:
        query = query.filter(Procedencia.activo == activo)
    
    return query.order_by(Procedencia.nombre).all()

@router.post("/procedencias", response_model=ProcedenciaResponse, status_code=status.HTTP_201_CREATED)
def crear_procedencia(
    procedencia_data: ProcedenciaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Crear nueva procedencia"""
    # Verificar si ya existe
    existente = db.query(Procedencia).filter(Procedencia.nombre == procedencia_data.nombre).first()
    if existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Procedencia ya existe"
        )
    
    nueva_procedencia = Procedencia(nombre=procedencia_data.nombre)
    db.add(nueva_procedencia)
    db.commit()
    db.refresh(nueva_procedencia)
    
    return nueva_procedencia

# ============================================
# CÓDIGOS MAI
# ============================================
@router.get("/codigos-mai", response_model=List[CodigoMAIResponse])
def listar_codigos_mai(
    tipo_examen: Optional[str] = Query(None, pattern="^(TAC|RX|ECO)$"),
    activo: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Listar códigos MAI filtrados por tipo de examen"""
    query = db.query(CodigoMAI)
    
    if tipo_examen:
        query = query.filter(CodigoMAI.tipo_examen == tipo_examen)
    
    if activo is not None:
        query = query.filter(CodigoMAI.activo == activo)
    
    return query.order_by(CodigoMAI.codigo).all()

@router.post("/codigos-mai", response_model=CodigoMAIResponse, status_code=status.HTTP_201_CREATED)
def crear_codigo_mai(
    codigo_data: CodigoMAICreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)  # Solo admin
):
    """Crear nuevo código MAI"""
    # Verificar si ya existe
    existente = db.query(CodigoMAI).filter(
        CodigoMAI.tipo_examen == codigo_data.tipo_examen,
        CodigoMAI.codigo == codigo_data.codigo
    ).first()
    
    if existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Código {codigo_data.codigo} ya existe para {codigo_data.tipo_examen}"
        )
    
    nuevo_codigo = CodigoMAI(**codigo_data.dict())
    db.add(nuevo_codigo)
    db.commit()
    db.refresh(nuevo_codigo)
    
    return nuevo_codigo

@router.get("/codigos-mai/visor")
def visor_codigos_mai(
    tipo_examen: str = Query(..., pattern="^(TAC|RX|ECO)$"),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)  # ← Requiere auth
):
    """
    Visor de códigos MAI por tipo de examen
    
    Devuelve lista completa de códigos con sus descripciones
    Útil para tener en ventana aparte como referencia
    """
    
    codigos = db.query(CodigoMAI).filter(
        CodigoMAI.tipo_examen == tipo_examen,
        CodigoMAI.activo == True
    ).order_by(CodigoMAI.codigo).all()
    
    return {
        "tipo_examen": tipo_examen,
        "total": len(codigos),
        "codigos": [
            {
                "id": c.id,
                "codigo": c.codigo,
                "descripcion": c.descripcion
            }
            for c in codigos
        ]
    }

# ============================================
# PROTOCOLOS TAC
# ============================================
@router.get("/protocolos-tac", response_model=List[ProtocoloTACResponse])
def listar_protocolos_tac(
    activo: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Listar protocolos TAC"""
    query = db.query(ProtocoloTAC)
    
    if activo is not None:
        query = query.filter(ProtocoloTAC.activo == activo)
    
    return query.order_by(ProtocoloTAC.nombre).all()

@router.post("/protocolos-tac", response_model=ProtocoloTACResponse, status_code=status.HTTP_201_CREATED)
def crear_protocolo_tac(
    protocolo_data: ProtocoloTACCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Crear nuevo protocolo TAC"""
    existente = db.query(ProtocoloTAC).filter(ProtocoloTAC.nombre == protocolo_data.nombre).first()
    if existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Protocolo ya existe"
        )
    
    nuevo_protocolo = ProtocoloTAC(nombre=protocolo_data.nombre)
    db.add(nuevo_protocolo)
    db.commit()
    db.refresh(nuevo_protocolo)
    
    return nuevo_protocolo

# ============================================
# DIAGNÓSTICOS
# ============================================
@router.get("/diagnosticos", response_model=List[DiagnosticoResponse])
def listar_diagnosticos(
    activo: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Listar diagnósticos"""
    query = db.query(Diagnostico)
    
    if activo is not None:
        query = query.filter(Diagnostico.activo == activo)
    
    if search:
        query = query.filter(Diagnostico.nombre.ilike(f"%{search}%"))
    
    return query.order_by(Diagnostico.nombre).all()

@router.post("/diagnosticos", response_model=DiagnosticoResponse, status_code=status.HTTP_201_CREATED)
def crear_diagnostico(
    diagnostico_data: DiagnosticoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Crear nuevo diagnóstico"""
    existente = db.query(Diagnostico).filter(Diagnostico.nombre == diagnostico_data.nombre).first()
    if existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Diagnóstico ya existe"
        )
    
    nuevo_diagnostico = Diagnostico(nombre=diagnostico_data.nombre)
    db.add(nuevo_diagnostico)
    db.commit()
    db.refresh(nuevo_diagnostico)
    
    return nuevo_diagnostico

# ============================================
# PERSONAL MÉDICO
# ============================================
@router.get("/personal-medico", response_model=List[PersonalMedicoResponse])
def listar_personal_medico(
    tipo: Optional[str] = Query(None, pattern="^(TM|TP|MEDICO|SECRETARIA|GENERAL)$"),
    activo: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Listar personal médico"""
    query = db.query(PersonalMedico)
    
    if tipo:
        query = query.filter(PersonalMedico.tipo == tipo)
    
    if activo is not None:
        query = query.filter(PersonalMedico.activo == activo)
    
    if search:
        query = query.filter(PersonalMedico.nombre.ilike(f"%{search}%"))
    
    return query.order_by(PersonalMedico.nombre).all()

@router.post("/personal-medico", response_model=PersonalMedicoResponse, status_code=status.HTTP_201_CREATED)
def crear_personal_medico(
    personal_data: PersonalMedicoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Crear nuevo personal médico"""
    nuevo_personal = PersonalMedico(**personal_data.dict())
    db.add(nuevo_personal)
    db.commit()
    db.refresh(nuevo_personal)
    
    return nuevo_personal

# ============================================
# EXÁMENES ESPECÍFICOS
# ============================================
@router.get("/examenes-especificos", response_model=List[ExamenEspecificoResponse])
def listar_examenes_especificos(
    tipo_examen: Optional[str] = Query(None, pattern="^(TAC|RX|ECO)$"),
    activo: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Listar exámenes específicos filtrados por tipo"""
    query = db.query(ExamenEspecifico)
    
    if tipo_examen:
        query = query.filter(ExamenEspecifico.tipo_examen == tipo_examen)
    
    if activo is not None:
        query = query.filter(ExamenEspecifico.activo == activo)
    
    if search:
        query = query.filter(ExamenEspecifico.nombre.ilike(f"%{search}%"))
    
    return query.order_by(ExamenEspecifico.nombre).all()

@router.post("/examenes-especificos", response_model=ExamenEspecificoResponse, status_code=status.HTTP_201_CREATED)
def crear_examen_especifico(
    examen_data: ExamenEspecificoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Crear nuevo examen específico"""
    # Verificar si ya existe
    existente = db.query(ExamenEspecifico).filter(
        ExamenEspecifico.tipo_examen == examen_data.tipo_examen,
        ExamenEspecifico.nombre == examen_data.nombre
    ).first()
    
    if existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Examen '{examen_data.nombre}' ya existe para {examen_data.tipo_examen}"
        )
    
    nuevo_examen = ExamenEspecifico(**examen_data.dict())
    db.add(nuevo_examen)
    db.commit()
    db.refresh(nuevo_examen)
    
    return nuevo_examen