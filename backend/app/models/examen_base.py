from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, CheckConstraint, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class ExamenBase(Base):
    __tablename__ = "examenes_base"
    
    id = Column(Integer, primary_key=True, index=True)
    tipo_examen = Column(String(10), nullable=False, index=True)
    
    # Datos comunes
    fecha_realizacion = Column(Date, nullable=False, index=True)
    atencion = Column(String(20), nullable=False)
    prevision_id = Column(Integer, ForeignKey("previsiones.id"))
    procedencia_id = Column(Integer, ForeignKey("procedencias.id"))
    paciente_id = Column(Integer, ForeignKey("pacientes.id"), nullable=False, index=True)
    examen_especifico_id = Column(Integer, ForeignKey("examenes_especificos.id"), nullable=False)
    codigo_mai_id = Column(Integer, ForeignKey("codigos_mai.id"))
    contrato = Column(String(50))
    
    # Auditoría
    mes_realizacion = Column(Integer, nullable=False, index=True)
    anio_realizacion = Column(Integer, nullable=False, index=True)
    created_by = Column(Integer, ForeignKey("usuarios.id"))
    updated_by = Column(Integer, ForeignKey("usuarios.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)
    
    # Revisión (NUEVO)
    en_revision = Column(Boolean, default=False, index=True)
    motivo_revision = Column(Text, nullable=True)
    
    # Constraints
    __table_args__ = (
        CheckConstraint("tipo_examen IN ('TAC', 'RX', 'ECO')", name="check_tipo_examen"),
        CheckConstraint("atencion IN ('Abierta', 'Cerrada', 'Urgencia')", name="check_atencion"),
        CheckConstraint("mes_realizacion BETWEEN 1 AND 12", name="check_mes"),
    )
    
    # Relaciones
    prevision = relationship("Prevision", back_populates="examenes")
    procedencia = relationship("Procedencia", back_populates="examenes")
    paciente = relationship("Paciente", back_populates="examenes")
    examen_especifico = relationship("ExamenEspecifico")
    codigo_mai = relationship("CodigoMAI", back_populates="examenes")
    creador = relationship("Usuario", foreign_keys=[created_by], back_populates="examenes_creados")
    modificador = relationship("Usuario", foreign_keys=[updated_by], back_populates="examenes_modificados")
    
    # Relaciones específicas (1:1)
    examen_tac = relationship("ExamenTAC", uselist=False, back_populates="examen_base", cascade="all, delete-orphan")
    examen_rx = relationship("ExamenRX", uselist=False, back_populates="examen_base", cascade="all, delete-orphan")
    examen_eco = relationship("ExamenECO", uselist=False, back_populates="examen_base", cascade="all, delete-orphan")