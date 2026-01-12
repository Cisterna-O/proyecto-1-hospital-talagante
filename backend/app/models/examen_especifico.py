from sqlalchemy import Column, Integer, String, Boolean, DateTime, CheckConstraint
from datetime import datetime
from ..database import Base

class ExamenEspecifico(Base):
    __tablename__ = "examenes_especificos"
    
    id = Column(Integer, primary_key=True, index=True)
    tipo_examen = Column(String(10), nullable=False, index=True)
    nombre = Column(String(200), nullable=False)
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        CheckConstraint("tipo_examen IN ('TAC', 'RX', 'ECO')", name="check_tipo_examen_especifico"),
    )