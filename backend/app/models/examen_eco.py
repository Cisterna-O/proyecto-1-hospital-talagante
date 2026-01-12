from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class ExamenECO(Base):
    __tablename__ = "examenes_eco"
    
    id = Column(Integer, primary_key=True, index=True)
    examen_base_id = Column(Integer, ForeignKey("examenes_base.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Datos específicos ECO
    diagnostico_id = Column(Integer, ForeignKey("diagnosticos.id"))
    realizado_id = Column(Integer, ForeignKey("personal_medico.id"))
    transcribe_id = Column(Integer, ForeignKey("personal_medico.id"))
    
    # Relaciones
    examen_base = relationship("ExamenBase", back_populates="examen_eco")
    diagnostico = relationship("Diagnostico", back_populates="examenes_eco")
    realizado = relationship("PersonalMedico", foreign_keys=[realizado_id])
    transcribe = relationship("PersonalMedico", foreign_keys=[transcribe_id])