from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models.paciente import Paciente
from ..models.usuario import Usuario
from ..schemas.paciente import (
    PacienteCreate,
    PacienteUpdate,
    PacienteResponse,
    PacienteAutocomplete
)
from ..middleware.auth_middleware import get_current_user
from ..utils.validators import validar_rut_chileno, calcular_edad, formatear_rut
from ..utils.helpers import limpiar_rut

router = APIRouter()

@router.post("/", response_model=PacienteResponse, status_code=status.HTTP_201_CREATED)
def crear_paciente(
    paciente_data: PacienteCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Crear nuevo paciente
    """
    # Limpiar y validar RUT
    rut_limpio = limpiar_rut(paciente_data.rut)
    
    if not validar_rut_chileno(rut_limpio):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="RUT inválido"
        )
    
    # Verificar si ya existe
    paciente_existente = db.query(Paciente).filter(Paciente.rut == rut_limpio).first()
    if paciente_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Paciente con RUT {formatear_rut(rut_limpio)} ya existe"
        )
    
    # Crear paciente
    nuevo_paciente = Paciente(
        rut=rut_limpio,
        nombre_completo=paciente_data.nombre_completo,
        fecha_nacimiento=paciente_data.fecha_nacimiento
    )
    
    db.add(nuevo_paciente)
    db.commit()
    db.refresh(nuevo_paciente)
    
    return nuevo_paciente

@router.get("/autocomplete/{rut}", response_model=PacienteAutocomplete)
def autocomplete_paciente(
    rut: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Buscar paciente por RUT para autocompletar formulario
    """
    rut_limpio = limpiar_rut(rut)
    
    paciente = db.query(Paciente).filter(Paciente.rut == rut_limpio).first()
    
    if not paciente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente no encontrado"
        )
    
    # Calcular edad si tiene fecha de nacimiento
    edad = None
    if paciente.fecha_nacimiento:
        edad = calcular_edad(paciente.fecha_nacimiento)
    
    return PacienteAutocomplete(
        rut=formatear_rut(paciente.rut),
        nombre_completo=paciente.nombre_completo,
        fecha_nacimiento=paciente.fecha_nacimiento,
        edad=edad
    )

@router.get("/", response_model=List[PacienteResponse])
def listar_pacientes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Listar pacientes con búsqueda opcional
    """
    query = db.query(Paciente)
    
    # Búsqueda por nombre o RUT
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Paciente.nombre_completo.ilike(search_term)) |
            (Paciente.rut.ilike(search_term))
        )
    
    pacientes = query.offset(skip).limit(limit).all()
    return pacientes

@router.get("/{paciente_id}", response_model=PacienteResponse)
def obtener_paciente(
    paciente_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Obtener paciente por ID
    """
    paciente = db.query(Paciente).filter(Paciente.id == paciente_id).first()
    
    if not paciente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente no encontrado"
        )
    
    return paciente

@router.put("/{paciente_id}", response_model=PacienteResponse)
def actualizar_paciente(
    paciente_id: int,
    paciente_data: PacienteUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Actualizar datos de paciente
    """
    paciente = db.query(Paciente).filter(Paciente.id == paciente_id).first()
    
    if not paciente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente no encontrado"
        )
    
    # Actualizar solo campos proporcionados
    if paciente_data.nombre_completo is not None:
        paciente.nombre_completo = paciente_data.nombre_completo
    
    if paciente_data.fecha_nacimiento is not None:
        paciente.fecha_nacimiento = paciente_data.fecha_nacimiento
    
    db.commit()
    db.refresh(paciente)
    
    return paciente

@router.delete("/{paciente_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_paciente(
    paciente_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Eliminar paciente (solo administradores)
    """
    if current_user.rol != "administrador":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para eliminar pacientes"
        )
    
    paciente = db.query(Paciente).filter(Paciente.id == paciente_id).first()
    
    if not paciente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente no encontrado"
        )
    
    db.delete(paciente)
    db.commit()
    
    return None