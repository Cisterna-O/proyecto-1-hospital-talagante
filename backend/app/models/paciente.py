from sqlalchemy import Column, Integer, String, Date, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base
from ..utils.timezone import get_chile_time

class Paciente(Base):
    __tablename__ = "pacientes"
    
    id = Column(Integer, primary_key=True, index=True)
    rut = Column(String(12), unique=True, nullable=False, index=True)
    tipo_identificacion = Column(String(20), default="RUT_CHILENO")  # RUT_CHILENO, RUT_EXTRANJERO, PASAPORTE, OTRO
    nombre_completo = Column(String(200), nullable=False, index=True)
    fecha_nacimiento = Column(Date, nullable=True)
    created_at = Column(DateTime, default=get_chile_time)
    updated_at = Column(DateTime, default=get_chile_time, onupdate=get_chile_time)
    
    # Relaciones
    examenes = relationship("ExamenBase", back_populates="paciente", cascade="all, delete-orphan")

    @property
    def edad(self):
        if not self.fecha_nacimiento:
            return None
        from datetime import date
        today = date.today()
        return today.year - self.fecha_nacimiento.year - (
            (today.month, today.day) < (self.fecha_nacimiento.month, self.fecha_nacimiento.day)
            )