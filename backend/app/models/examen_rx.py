from sqlalchemy import Column, Integer, Time, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class ExamenRX(Base):
    __tablename__ = "examenes_rx"
    
    id = Column(Integer, primary_key=True, index=True)
    examen_base_id = Column(Integer, ForeignKey("examenes_base.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Datos específicos RX
    hora_realizacion = Column(Time, nullable=False)
    tm_tp_id = Column(Integer, ForeignKey("personal_medico.id"))
    
    # Relaciones
    examen_base = relationship("ExamenBase", back_populates="examen_rx")
    tm_tp = relationship("PersonalMedico")