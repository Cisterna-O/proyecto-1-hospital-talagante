from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from pydantic import BaseModel

from ..database import get_db
from ..models.usuario import Usuario
from ..models.paciente import Paciente
from ..models.examen_base import ExamenBase
from ..models.examen_tac import ExamenTAC
from ..models.examen_rx import ExamenRX
from ..models.examen_eco import ExamenECO
from ..schemas.examen import (
    ExamenTACCreate,
    ExamenTACUpdate,
    ExamenTACResponse,
    ExamenRXCreate,
    ExamenRXUpdate,
    ExamenRXResponse,
    ExamenECOCreate,
    ExamenECOUpdate,
    ExamenECOResponse
)
from ..middleware.auth_middleware import get_current_user, require_admin, require_ingresador_o_admin
from ..utils.validators import validar_rut_chileno, calcular_edad
from ..utils.helpers import limpiar_rut, extraer_mes_anio

router = APIRouter()

# ============================================
# FUNCIONES AUXILIARES
# ============================================

def obtener_o_crear_paciente(db: Session, rut: str, nombre: str = None, fecha_nac: date = None) -> Paciente:
    """
    Buscar paciente por RUT, si no existe lo crea
    """
    rut_limpio = limpiar_rut(rut)
    
    # Validar RUT
    if not validar_rut_chileno(rut_limpio):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="RUT inválido"
        )
    
    # Buscar paciente existente
    paciente = db.query(Paciente).filter(Paciente.rut == rut_limpio).first()
    
    if paciente:
        # Si existe, actualizar fecha_nacimiento si se proporcionó y no tenía
        if fecha_nac and not paciente.fecha_nacimiento:
            paciente.fecha_nacimiento = fecha_nac
            db.commit()
            db.refresh(paciente)
        return paciente
    
    # Si no existe, crear nuevo paciente
    if not nombre:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debe proporcionar el nombre del paciente si no existe en el sistema"
        )
    
    nuevo_paciente = Paciente(
        rut=rut_limpio,
        nombre_completo=nombre,
        fecha_nacimiento=fecha_nac
    )
    
    db.add(nuevo_paciente)
    db.commit()
    db.refresh(nuevo_paciente)
    
    return nuevo_paciente

# ============================================
# CRUD EXAMEN TAC
# ============================================

@router.post("/tac", response_model=ExamenTACResponse, status_code=status.HTTP_201_CREATED)
def crear_examen_tac(
    examen_data: ExamenTACCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_ingresador_o_admin)
):
    """
    Crear nuevo examen TAC
    
    - Si el paciente no existe (por RUT), se crea automáticamente
    - La edad se calcula automáticamente desde fecha_nacimiento
    - El mes y año se extraen automáticamente de fecha_realización
    """
    
    # 1. Obtener o crear paciente
    paciente = obtener_o_crear_paciente(
        db=db,
        rut=examen_data.paciente_rut,
        nombre=examen_data.paciente_nombre,
        fecha_nac=examen_data.fecha_nacimiento
    )
    
    # 2. Extraer mes y año de fecha realización
    mes, anio = extraer_mes_anio(examen_data.fecha_realizacion)
    
    # 3. Calcular edad si hay fecha de nacimiento
    edad = None
    if examen_data.fecha_nacimiento:
        edad = calcular_edad(examen_data.fecha_nacimiento, examen_data.fecha_realizacion)
    
    # 4. Crear ExamenBase (datos comunes)
    examen_base = ExamenBase(
        tipo_examen="TAC",
        fecha_realizacion=examen_data.fecha_realizacion,
        atencion=examen_data.atencion,
        prevision_id=examen_data.prevision_id,
        procedencia_id=examen_data.procedencia_id,
        paciente_id=paciente.id,
        examen_especifico_id=examen_data.examen_especifico_id,
        codigo_mai_id=examen_data.codigo_mai_id,
        contrato=examen_data.contrato,
        mes_realizacion=mes,
        anio_realizacion=anio,
        created_by=current_user.id,
        updated_by=current_user.id
    )
    
    db.add(examen_base)
    db.flush()  # Para obtener el ID sin hacer commit
    
    # 5. Crear ExamenTAC (datos específicos)
    examen_tac = ExamenTAC(
        examen_base_id=examen_base.id,
        fecha_solicitud=examen_data.fecha_solicitud,
        hora_realizacion=examen_data.hora_realizacion,
        fecha_nacimiento=examen_data.fecha_nacimiento,
        edad=edad,
        externo=examen_data.externo,
        protocolo_id=examen_data.protocolo_id,
        cod_acv=examen_data.cod_acv,
        ges=examen_data.ges,
        medio_contraste=examen_data.medio_contraste,
        vfge=examen_data.vfge,
        premedicado=examen_data.premedicado,
        diagnostico_clinico_id=examen_data.diagnostico_clinico_id,
        medico_solicitante_id=examen_data.medico_solicitante_id,
        tm_id=examen_data.tm_id,
        tp_id=examen_data.tp_id,
        secretaria_id=examen_data.secretaria_id,
        observacion=examen_data.observacion
    )
    
    db.add(examen_tac)
    db.commit()
    db.refresh(examen_base)
    db.refresh(examen_tac)
    
    # 6. Construir respuesta combinando datos base + TAC
    return ExamenTACResponse(
        id=examen_base.id,
        tipo_examen=examen_base.tipo_examen,
        fecha_realizacion=examen_base.fecha_realizacion,
        atencion=examen_base.atencion,
        mes_realizacion=examen_base.mes_realizacion,
        anio_realizacion=examen_base.anio_realizacion,
        created_at=examen_base.created_at,
        fecha_solicitud=examen_tac.fecha_solicitud,
        hora_realizacion=examen_tac.hora_realizacion,
        edad=examen_tac.edad,
        cod_acv=examen_tac.cod_acv,
        ges=examen_tac.ges,
        medio_contraste=examen_tac.medio_contraste,
        observacion=examen_tac.observacion
    )

@router.get("/tac", response_model=List[ExamenTACResponse])
def listar_examenes_tac(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    fecha_inicio: Optional[date] = None,
    fecha_fin: Optional[date] = None,
    paciente_rut: Optional[str] = None,
    mes: Optional[int] = Query(None, ge=1, le=12),
    anio: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_ingresador_o_admin)
):
    """
    Listar exámenes TAC con filtros opcionales
    
    Filtros disponibles:
    - fecha_inicio / fecha_fin: Rango de fechas
    - paciente_rut: Buscar por RUT del paciente
    - mes / anio: Filtrar por mes y/o año
    """
    
    # Query base: JOIN entre ExamenBase y ExamenTAC
    query = db.query(ExamenBase, ExamenTAC).join(
        ExamenTAC, ExamenBase.id == ExamenTAC.examen_base_id
    ).filter(
        ExamenBase.tipo_examen == "TAC",
        ExamenBase.deleted_at.is_(None)  # Solo exámenes no eliminados
    )
    
    # Aplicar filtros
    if fecha_inicio:
        query = query.filter(ExamenBase.fecha_realizacion >= fecha_inicio)
    
    if fecha_fin:
        query = query.filter(ExamenBase.fecha_realizacion <= fecha_fin)
    
    if paciente_rut:
        rut_limpio = limpiar_rut(paciente_rut)
        paciente = db.query(Paciente).filter(Paciente.rut == rut_limpio).first()
        if paciente:
            query = query.filter(ExamenBase.paciente_id == paciente.id)
        else:
            return []  # Si no existe el paciente, retornar lista vacía
    
    if mes:
        query = query.filter(ExamenBase.mes_realizacion == mes)
    
    if anio:
        query = query.filter(ExamenBase.anio_realizacion == anio)
    
    # Ordenar por fecha descendente (más recientes primero)
    query = query.order_by(ExamenBase.fecha_realizacion.desc())
    
    # Paginación
    resultados = query.offset(skip).limit(limit).all()
    
    # Construir respuestas
    examenes = []
    for examen_base, examen_tac in resultados:
        examenes.append(ExamenTACResponse(
            id=examen_base.id,
            tipo_examen=examen_base.tipo_examen,
            fecha_realizacion=examen_base.fecha_realizacion,
            atencion=examen_base.atencion,
            mes_realizacion=examen_base.mes_realizacion,
            anio_realizacion=examen_base.anio_realizacion,
            created_at=examen_base.created_at,
            fecha_solicitud=examen_tac.fecha_solicitud,
            hora_realizacion=examen_tac.hora_realizacion,
            edad=examen_tac.edad,
            cod_acv=examen_tac.cod_acv,
            ges=examen_tac.ges,
            medio_contraste=examen_tac.medio_contraste,
            observacion=examen_tac.observacion
        ))
    
    return examenes

@router.get("/tac/{examen_id}", response_model=ExamenTACResponse)
def obtener_examen_tac(
    examen_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_ingresador_o_admin)
):
    """
    Obtener un examen TAC específico por ID
    """
    resultado = db.query(ExamenBase, ExamenTAC).join(
        ExamenTAC, ExamenBase.id == ExamenTAC.examen_base_id
    ).filter(
        ExamenBase.id == examen_id,
        ExamenBase.tipo_examen == "TAC",
        ExamenBase.deleted_at.is_(None)
    ).first()
    
    if not resultado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Examen TAC no encontrado"
        )
    
    examen_base, examen_tac = resultado
    
    return ExamenTACResponse(
        id=examen_base.id,
        tipo_examen=examen_base.tipo_examen,
        fecha_realizacion=examen_base.fecha_realizacion,
        atencion=examen_base.atencion,
        mes_realizacion=examen_base.mes_realizacion,
        anio_realizacion=examen_base.anio_realizacion,
        created_at=examen_base.created_at,
        fecha_solicitud=examen_tac.fecha_solicitud,
        hora_realizacion=examen_tac.hora_realizacion,
        edad=examen_tac.edad,
        cod_acv=examen_tac.cod_acv,
        ges=examen_tac.ges,
        medio_contraste=examen_tac.medio_contraste,
        observacion=examen_tac.observacion
    )

@router.put("/tac/{examen_id}", response_model=ExamenTACResponse)
def actualizar_examen_tac(
    examen_id: int,
    examen_data: ExamenTACUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """
    Actualizar examen TAC
    
    Solo administradores pueden modificar exámenes
    """
    # Verificar permisos
    if current_user.rol != "administrador":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo administradores pueden modificar exámenes"
        )
    
    # Buscar examen
    examen_base = db.query(ExamenBase).filter(
        ExamenBase.id == examen_id,
        ExamenBase.tipo_examen == "TAC",
        ExamenBase.deleted_at.is_(None)
    ).first()
    
    if not examen_base:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Examen TAC no encontrado"
        )
    
    examen_tac = db.query(ExamenTAC).filter(
        ExamenTAC.examen_base_id == examen_id
    ).first()
    
    # Actualizar datos base
    update_data = examen_data.dict(exclude_unset=True)
    
    # Separar campos de ExamenBase y ExamenTAC
    campos_base = ['fecha_realizacion', 'atencion', 'prevision_id', 'procedencia_id', 'codigo_mai_id', 'contrato']
    campos_tac = ['fecha_solicitud', 'hora_realizacion', 'fecha_nacimiento', 'externo', 'protocolo_id', 
                  'cod_acv', 'ges', 'medio_contraste', 'vfge', 'premedicado', 'diagnostico_clinico_id',
                  'medico_solicitante_id', 'tm_id', 'tp_id', 'secretaria_id', 'observacion']
    
    # Actualizar ExamenBase
    for campo in campos_base:
        if campo in update_data:
            setattr(examen_base, campo, update_data[campo])
    
    # Recalcular mes/año si cambió fecha_realizacion
    if 'fecha_realizacion' in update_data:
        mes, anio = extraer_mes_anio(update_data['fecha_realizacion'])
        examen_base.mes_realizacion = mes
        examen_base.anio_realizacion = anio
    
    examen_base.updated_by = current_user.id
    
    # Actualizar ExamenTAC
    for campo in campos_tac:
        if campo in update_data:
            setattr(examen_tac, campo, update_data[campo])
    
    # Recalcular edad si cambió fecha_nacimiento
    if 'fecha_nacimiento' in update_data and update_data['fecha_nacimiento']:
        examen_tac.edad = calcular_edad(update_data['fecha_nacimiento'], examen_base.fecha_realizacion)
    
    db.commit()
    db.refresh(examen_base)
    db.refresh(examen_tac)
    
    return ExamenTACResponse(
        id=examen_base.id,
        tipo_examen=examen_base.tipo_examen,
        fecha_realizacion=examen_base.fecha_realizacion,
        atencion=examen_base.atencion,
        mes_realizacion=examen_base.mes_realizacion,
        anio_realizacion=examen_base.anio_realizacion,
        created_at=examen_base.created_at,
        fecha_solicitud=examen_tac.fecha_solicitud,
        hora_realizacion=examen_tac.hora_realizacion,
        edad=examen_tac.edad,
        cod_acv=examen_tac.cod_acv,
        ges=examen_tac.ges,
        medio_contraste=examen_tac.medio_contraste,
        observacion=examen_tac.observacion
    )

@router.delete("/tac/{examen_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_examen_tac(
    examen_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)  # Solo admin
):
    """
    Eliminar examen TAC (soft delete)
    
    Solo administradores pueden eliminar exámenes
    """
    from datetime import datetime
    
    examen_base = db.query(ExamenBase).filter(
        ExamenBase.id == examen_id,
        ExamenBase.tipo_examen == "TAC",
        ExamenBase.deleted_at.is_(None)
    ).first()
    
    if not examen_base:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Examen TAC no encontrado"
        )
    
    # Soft delete: marcar como eliminado
    examen_base.deleted_at = datetime.utcnow()
    examen_base.updated_by = current_user.id
    
    db.commit()
    
    return None

# ============================================
# CRUD EXAMEN RX
# ============================================

@router.post("/rx", response_model=ExamenRXResponse, status_code=status.HTTP_201_CREATED)
def crear_examen_rx(
    examen_data: ExamenRXCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_ingresador_o_admin)
):
    """
    Crear nuevo examen RX
    
    - Si el paciente no existe (por RUT), se crea automáticamente
    - El mes y año se extraen automáticamente de fecha_realización
    """
    
    # 1. Obtener o crear paciente
    paciente = obtener_o_crear_paciente(
        db=db,
        rut=examen_data.paciente_rut,
        nombre=examen_data.paciente_nombre,
        fecha_nac=None  # RX no tiene fecha de nacimiento
    )
    
    # 2. Extraer mes y año de fecha realización
    mes, anio = extraer_mes_anio(examen_data.fecha_realizacion)
    
    # 3. Crear ExamenBase (datos comunes)
    examen_base = ExamenBase(
        tipo_examen="RX",
        fecha_realizacion=examen_data.fecha_realizacion,
        atencion=examen_data.atencion,
        prevision_id=examen_data.prevision_id,
        procedencia_id=examen_data.procedencia_id,
        paciente_id=paciente.id,
        examen_especifico_id=examen_data.examen_especifico_id,
        codigo_mai_id=examen_data.codigo_mai_id,
        contrato=examen_data.contrato,
        mes_realizacion=mes,
        anio_realizacion=anio,
        created_by=current_user.id,
        updated_by=current_user.id
    )
    
    db.add(examen_base)
    db.flush()
    
    # 4. Crear ExamenRX (datos específicos)
    examen_rx = ExamenRX(
        examen_base_id=examen_base.id,
        hora_realizacion=examen_data.hora_realizacion,
        tm_tp_id=examen_data.tm_tp_id
    )
    
    db.add(examen_rx)
    db.commit()
    db.refresh(examen_base)
    db.refresh(examen_rx)
    
    # 5. Construir respuesta
    return ExamenRXResponse(
        id=examen_base.id,
        tipo_examen=examen_base.tipo_examen,
        fecha_realizacion=examen_base.fecha_realizacion,
        atencion=examen_base.atencion,
        mes_realizacion=examen_base.mes_realizacion,
        anio_realizacion=examen_base.anio_realizacion,
        created_at=examen_base.created_at,
        hora_realizacion=examen_rx.hora_realizacion
    )

@router.get("/rx", response_model=List[ExamenRXResponse])
def listar_examenes_rx(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    fecha_inicio: Optional[date] = None,
    fecha_fin: Optional[date] = None,
    paciente_rut: Optional[str] = None,
    mes: Optional[int] = Query(None, ge=1, le=12),
    anio: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_ingresador_o_admin)
):
    """
    Listar exámenes RX con filtros opcionales
    """
    
    # Query base
    query = db.query(ExamenBase, ExamenRX).join(
        ExamenRX, ExamenBase.id == ExamenRX.examen_base_id
    ).filter(
        ExamenBase.tipo_examen == "RX",
        ExamenBase.deleted_at.is_(None)
    )
    
    # Aplicar filtros
    if fecha_inicio:
        query = query.filter(ExamenBase.fecha_realizacion >= fecha_inicio)
    
    if fecha_fin:
        query = query.filter(ExamenBase.fecha_realizacion <= fecha_fin)
    
    if paciente_rut:
        rut_limpio = limpiar_rut(paciente_rut)
        paciente = db.query(Paciente).filter(Paciente.rut == rut_limpio).first()
        if paciente:
            query = query.filter(ExamenBase.paciente_id == paciente.id)
        else:
            return []
    
    if mes:
        query = query.filter(ExamenBase.mes_realizacion == mes)
    
    if anio:
        query = query.filter(ExamenBase.anio_realizacion == anio)
    
    # Ordenar y paginar
    query = query.order_by(ExamenBase.fecha_realizacion.desc())
    resultados = query.offset(skip).limit(limit).all()
    
    # Construir respuestas
    examenes = []
    for examen_base, examen_rx in resultados:
        examenes.append(ExamenRXResponse(
            id=examen_base.id,
            tipo_examen=examen_base.tipo_examen,
            fecha_realizacion=examen_base.fecha_realizacion,
            atencion=examen_base.atencion,
            mes_realizacion=examen_base.mes_realizacion,
            anio_realizacion=examen_base.anio_realizacion,
            created_at=examen_base.created_at,
            hora_realizacion=examen_rx.hora_realizacion
        ))
    
    return examenes

@router.get("/rx/{examen_id}", response_model=ExamenRXResponse)
def obtener_examen_rx(
    examen_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_ingresador_o_admin)
):
    """
    Obtener un examen RX específico por ID
    """
    resultado = db.query(ExamenBase, ExamenRX).join(
        ExamenRX, ExamenBase.id == ExamenRX.examen_base_id
    ).filter(
        ExamenBase.id == examen_id,
        ExamenBase.tipo_examen == "RX",
        ExamenBase.deleted_at.is_(None)
    ).first()
    
    if not resultado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Examen RX no encontrado"
        )
    
    examen_base, examen_rx = resultado
    
    return ExamenRXResponse(
        id=examen_base.id,
        tipo_examen=examen_base.tipo_examen,
        fecha_realizacion=examen_base.fecha_realizacion,
        atencion=examen_base.atencion,
        mes_realizacion=examen_base.mes_realizacion,
        anio_realizacion=examen_base.anio_realizacion,
        created_at=examen_base.created_at,
        hora_realizacion=examen_rx.hora_realizacion
    )

@router.put("/rx/{examen_id}", response_model=ExamenRXResponse)
def actualizar_examen_rx(
    examen_id: int,
    examen_data: ExamenRXUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """
    Actualizar examen RX (solo administradores)
    """
    if current_user.rol != "administrador":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo administradores pueden modificar exámenes"
        )
    
    # Buscar examen
    examen_base = db.query(ExamenBase).filter(
        ExamenBase.id == examen_id,
        ExamenBase.tipo_examen == "RX",
        ExamenBase.deleted_at.is_(None)
    ).first()
    
    if not examen_base:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Examen RX no encontrado"
        )
    
    examen_rx = db.query(ExamenRX).filter(
        ExamenRX.examen_base_id == examen_id
    ).first()
    
    # Actualizar datos
    update_data = examen_data.dict(exclude_unset=True)
    
    # Campos de ExamenBase
    campos_base = ['fecha_realizacion', 'atencion', 'prevision_id', 'procedencia_id', 'codigo_mai_id', 'contrato']
    for campo in campos_base:
        if campo in update_data:
            setattr(examen_base, campo, update_data[campo])
    
    # Recalcular mes/año si cambió fecha
    if 'fecha_realizacion' in update_data:
        mes, anio = extraer_mes_anio(update_data['fecha_realizacion'])
        examen_base.mes_realizacion = mes
        examen_base.anio_realizacion = anio
    
    examen_base.updated_by = current_user.id
    
    # Campos de ExamenRX
    if 'hora_realizacion' in update_data:
        examen_rx.hora_realizacion = update_data['hora_realizacion']
    if 'tm_tp_id' in update_data:
        examen_rx.tm_tp_id = update_data['tm_tp_id']
    
    db.commit()
    db.refresh(examen_base)
    db.refresh(examen_rx)
    
    return ExamenRXResponse(
        id=examen_base.id,
        tipo_examen=examen_base.tipo_examen,
        fecha_realizacion=examen_base.fecha_realizacion,
        atencion=examen_base.atencion,
        mes_realizacion=examen_base.mes_realizacion,
        anio_realizacion=examen_base.anio_realizacion,
        created_at=examen_base.created_at,
        hora_realizacion=examen_rx.hora_realizacion
    )

@router.delete("/rx/{examen_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_examen_rx(
    examen_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """
    Eliminar examen RX (soft delete, solo administradores)
    """
    from datetime import datetime
    
    examen_base = db.query(ExamenBase).filter(
        ExamenBase.id == examen_id,
        ExamenBase.tipo_examen == "RX",
        ExamenBase.deleted_at.is_(None)
    ).first()
    
    if not examen_base:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Examen RX no encontrado"
        )
    
    # Soft delete
    examen_base.deleted_at = datetime.utcnow()
    examen_base.updated_by = current_user.id
    
    db.commit()
    
    return None

# ============================================
# CRUD EXAMEN ECO
# ============================================

@router.post("/eco", response_model=ExamenECOResponse, status_code=status.HTTP_201_CREATED)
def crear_examen_eco(
    examen_data: ExamenECOCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_ingresador_o_admin)
):
    """
    Crear nuevo examen ECO
    
    - Si el paciente no existe (por RUT), se crea automáticamente
    - El mes y año se extraen automáticamente de fecha_realización
    """
    
    # 1. Obtener o crear paciente
    paciente = obtener_o_crear_paciente(
        db=db,
        rut=examen_data.paciente_rut,
        nombre=examen_data.paciente_nombre,
        fecha_nac=None  # ECO no requiere fecha de nacimiento
    )
    
    # 2. Extraer mes y año de fecha realización
    mes, anio = extraer_mes_anio(examen_data.fecha_realizacion)
    
    # 3. Crear ExamenBase (datos comunes)
    examen_base = ExamenBase(
        tipo_examen="ECO",
        fecha_realizacion=examen_data.fecha_realizacion,
        atencion=examen_data.atencion,
        prevision_id=examen_data.prevision_id,
        procedencia_id=examen_data.procedencia_id,
        paciente_id=paciente.id,
        examen_especifico_id=examen_data.examen_especifico_id,
        codigo_mai_id=examen_data.codigo_mai_id,
        contrato=examen_data.contrato,
        mes_realizacion=mes,
        anio_realizacion=anio,
        created_by=current_user.id,
        updated_by=current_user.id
    )
    
    db.add(examen_base)
    db.flush()
    
    # 4. Crear ExamenECO (datos específicos)
    examen_eco = ExamenECO(
        examen_base_id=examen_base.id,
        diagnostico_id=examen_data.diagnostico_id,
        realizado_id=examen_data.realizado_id,
        transcribe_id=examen_data.transcribe_id
    )
    
    db.add(examen_eco)
    db.commit()
    db.refresh(examen_base)
    db.refresh(examen_eco)
    
    # 5. Construir respuesta
    return ExamenECOResponse(
        id=examen_base.id,
        tipo_examen=examen_base.tipo_examen,
        fecha_realizacion=examen_base.fecha_realizacion,
        atencion=examen_base.atencion,
        mes_realizacion=examen_base.mes_realizacion,
        anio_realizacion=examen_base.anio_realizacion,
        created_at=examen_base.created_at
    )

@router.get("/eco", response_model=List[ExamenECOResponse])
def listar_examenes_eco(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    fecha_inicio: Optional[date] = None,
    fecha_fin: Optional[date] = None,
    paciente_rut: Optional[str] = None,
    mes: Optional[int] = Query(None, ge=1, le=12),
    anio: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_ingresador_o_admin)
):
    """
    Listar exámenes ECO con filtros opcionales
    """
    
    # Query base
    query = db.query(ExamenBase, ExamenECO).join(
        ExamenECO, ExamenBase.id == ExamenECO.examen_base_id
    ).filter(
        ExamenBase.tipo_examen == "ECO",
        ExamenBase.deleted_at.is_(None)
    )
    
    # Aplicar filtros
    if fecha_inicio:
        query = query.filter(ExamenBase.fecha_realizacion >= fecha_inicio)
    
    if fecha_fin:
        query = query.filter(ExamenBase.fecha_realizacion <= fecha_fin)
    
    if paciente_rut:
        rut_limpio = limpiar_rut(paciente_rut)
        paciente = db.query(Paciente).filter(Paciente.rut == rut_limpio).first()
        if paciente:
            query = query.filter(ExamenBase.paciente_id == paciente.id)
        else:
            return []
    
    if mes:
        query = query.filter(ExamenBase.mes_realizacion == mes)
    
    if anio:
        query = query.filter(ExamenBase.anio_realizacion == anio)
    
    # Ordenar y paginar
    query = query.order_by(ExamenBase.fecha_realizacion.desc())
    resultados = query.offset(skip).limit(limit).all()
    
    # Construir respuestas
    examenes = []
    for examen_base, examen_eco in resultados:
        examenes.append(ExamenECOResponse(
            id=examen_base.id,
            tipo_examen=examen_base.tipo_examen,
            fecha_realizacion=examen_base.fecha_realizacion,
            atencion=examen_base.atencion,
            mes_realizacion=examen_base.mes_realizacion,
            anio_realizacion=examen_base.anio_realizacion,
            created_at=examen_base.created_at
        ))
    
    return examenes

@router.get("/eco/{examen_id}", response_model=ExamenECOResponse)
def obtener_examen_eco(
    examen_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_ingresador_o_admin)
):
    """
    Obtener un examen ECO específico por ID
    """
    resultado = db.query(ExamenBase, ExamenECO).join(
        ExamenECO, ExamenBase.id == ExamenECO.examen_base_id
    ).filter(
        ExamenBase.id == examen_id,
        ExamenBase.tipo_examen == "ECO",
        ExamenBase.deleted_at.is_(None)
    ).first()
    
    if not resultado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Examen ECO no encontrado"
        )
    
    examen_base, examen_eco = resultado
    
    return ExamenECOResponse(
        id=examen_base.id,
        tipo_examen=examen_base.tipo_examen,
        fecha_realizacion=examen_base.fecha_realizacion,
        atencion=examen_base.atencion,
        mes_realizacion=examen_base.mes_realizacion,
        anio_realizacion=examen_base.anio_realizacion,
        created_at=examen_base.created_at
    )

@router.put("/eco/{examen_id}", response_model=ExamenECOResponse)
def actualizar_examen_eco(
    examen_id: int,
    examen_data: ExamenECOUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """
    Actualizar examen ECO (solo administradores)
    """
    if current_user.rol != "administrador":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo administradores pueden modificar exámenes"
        )
    
    # Buscar examen
    examen_base = db.query(ExamenBase).filter(
        ExamenBase.id == examen_id,
        ExamenBase.tipo_examen == "ECO",
        ExamenBase.deleted_at.is_(None)
    ).first()
    
    if not examen_base:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Examen ECO no encontrado"
        )
    
    examen_eco = db.query(ExamenECO).filter(
        ExamenECO.examen_base_id == examen_id
    ).first()
    
    # Actualizar datos
    update_data = examen_data.dict(exclude_unset=True)
    
    # Campos de ExamenBase
    campos_base = ['fecha_realizacion', 'atencion', 'prevision_id', 'procedencia_id', 'codigo_mai_id', 'contrato']
    for campo in campos_base:
        if campo in update_data:
            setattr(examen_base, campo, update_data[campo])
    
    # Recalcular mes/año si cambió fecha
    if 'fecha_realizacion' in update_data:
        mes, anio = extraer_mes_anio(update_data['fecha_realizacion'])
        examen_base.mes_realizacion = mes
        examen_base.anio_realizacion = anio
    
    examen_base.updated_by = current_user.id
    
    # Campos de ExamenECO
    campos_eco = ['diagnostico_id', 'realizado_id', 'transcribe_id']
    for campo in campos_eco:
        if campo in update_data:
            setattr(examen_eco, campo, update_data[campo])
    
    db.commit()
    db.refresh(examen_base)
    db.refresh(examen_eco)
    
    return ExamenECOResponse(
        id=examen_base.id,
        tipo_examen=examen_base.tipo_examen,
        fecha_realizacion=examen_base.fecha_realizacion,
        atencion=examen_base.atencion,
        mes_realizacion=examen_base.mes_realizacion,
        anio_realizacion=examen_base.anio_realizacion,
        created_at=examen_base.created_at
    )

@router.delete("/eco/{examen_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_examen_eco(
    examen_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """
    Eliminar examen ECO (soft delete, solo administradores)
    """
    from datetime import datetime
    
    examen_base = db.query(ExamenBase).filter(
        ExamenBase.id == examen_id,
        ExamenBase.tipo_examen == "ECO",
        ExamenBase.deleted_at.is_(None)
    ).first()
    
    if not examen_base:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Examen ECO no encontrado"
        )
    
    # Soft delete
    examen_base.deleted_at = datetime.utcnow()
    examen_base.updated_by = current_user.id
    
    db.commit()
    
    return None


# Schema
class MarcarRevisionRequest(BaseModel):
    en_revision: bool
    motivo: Optional[str] = None

# Endpoint
@router.patch("/{examen_id}/revision")
def marcar_examen_revision(
    examen_id: int,
    datos: MarcarRevisionRequest,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """
    Marcar/desmarcar examen como en revisión (solo admin)
    
    Útil para señalar exámenes con posibles errores
    """
    
    examen = db.query(ExamenBase).filter(
        ExamenBase.id == examen_id,
        ExamenBase.deleted_at.is_(None)
    ).first()
    
    if not examen:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Examen no encontrado"
        )
    
    examen.en_revision = datos.en_revision
    examen.motivo_revision = datos.motivo if datos.en_revision else None
    
    db.commit()
    
    return {
        "message": "Examen marcado para revisión" if datos.en_revision else "Marca de revisión eliminada",
        "examen_id": examen.id,
        "en_revision": examen.en_revision,
        "motivo": examen.motivo_revision
    }

# Endpoint para listar exámenes en revisión
@router.get("/en-revision")
def listar_examenes_revision(
    tipo_examen: Optional[str] = Query(None, pattern="^(TAC|RX|ECO)$"),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """
    Listar todos los exámenes marcados para revisión (solo admin)
    """
    
    query = db.query(ExamenBase).filter(
        ExamenBase.en_revision == True,
        ExamenBase.deleted_at.is_(None)
    )
    
    if tipo_examen:
        query = query.filter(ExamenBase.tipo_examen == tipo_examen)
    
    examenes = query.order_by(ExamenBase.created_at.desc()).all()
    
    return {
        "total": len(examenes),
        "examenes": [
            {
                "id": e.id,
                "tipo": e.tipo_examen,
                "fecha": e.fecha_realizacion.isoformat(),
                "motivo_revision": e.motivo_revision,
                "created_by": e.created_by
            }
            for e in examenes
        ]
    }