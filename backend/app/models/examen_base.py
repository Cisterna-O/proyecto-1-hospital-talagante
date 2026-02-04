from sqlalchemy import Column, Integer, String, Date, ForeignKey, DateTime, Boolean, Text, CheckConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class ExamenBase(Base):
    __tablename__ = "examenes_base"
    
    id = Column(Integer, primary_key=True, index=True)
    tipo_examen = Column(String(10), nullable=False)
    
    # Datos comunes
    fecha_realizacion = Column(Date, nullable=False, index=True)
    atencion = Column(String(20), nullable=False)
    prevision_id = Column(Integer, ForeignKey("previsiones.id"), nullable=True)
    procedencia_id = Column(Integer, ForeignKey("procedencias.id"), nullable=True)
    paciente_id = Column(Integer, ForeignKey("pacientes.id"), nullable=False, index=True)
    examen_especifico_id = Column(Integer, ForeignKey("examenes_especificos.id"), nullable=False)
    codigo_mai_id = Column(Integer, ForeignKey("codigos_mai.id"), nullable=True)
    contrato = Column(String(50), nullable=True)
    
    # Auditoría
    mes_realizacion = Column(Integer, nullable=False, index=True)
    anio_realizacion = Column(Integer, nullable=False, index=True)
    created_by = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    updated_by = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)
    en_revision = Column(Boolean, default=False)
    motivo_revision = Column(Text, nullable=True)
    
    # Constraints
    __table_args__ = (
        CheckConstraint("tipo_examen IN ('TAC', 'RX', 'ECO')", name="check_tipo_examen"),
        CheckConstraint("atencion IN ('Abierta', 'Cerrada', 'Urgencia')", name="check_atencion"),
        CheckConstraint("mes_realizacion >= 1 AND mes_realizacion <= 12", name="check_mes"),
    )
    
    # Relaciones
    paciente = relationship("Paciente", back_populates="examenes")
    prevision = relationship("Prevision")
    procedencia = relationship("Procedencia")
    codigo_mai = relationship("CodigoMAI")
    examen_especifico = relationship("ExamenEspecifico")
    creador = relationship("Usuario", foreign_keys=[created_by])
    modificador = relationship("Usuario", foreign_keys=[updated_by])
    
    # Relaciones uno a uno con exámenes específicos
    examen_tac = relationship("ExamenTAC", back_populates="examen_base", uselist=False, cascade="all, delete-orphan")
    examen_rx = relationship("ExamenRX", back_populates="examen_base", uselist=False, cascade="all, delete-orphan")
    examen_eco = relationship("ExamenECO", back_populates="examen_base", uselist=False, cascade="all, delete-orphan")