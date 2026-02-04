from sqlalchemy import Column, Integer, String, Boolean, Date, Time, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..database import Base

class ExamenTAC(Base):
    __tablename__ = "examenes_tac"
    
    id = Column(Integer, primary_key=True, index=True)
    examen_base_id = Column(Integer, ForeignKey("examenes_base.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Datos específicos TAC
    fecha_solicitud = Column(Date, nullable=False)
    hora_realizacion = Column(Time, nullable=False)
    fecha_nacimiento = Column(Date, nullable=True)
    edad = Column(Integer, nullable=True)
    externo = Column(String(50), nullable=True)
    protocolo_id = Column(Integer, ForeignKey("protocolos_tac.id"), nullable=True)
    cod_acv = Column(Boolean, nullable=False)
    ges = Column(Boolean, nullable=False)
    medio_contraste = Column(Boolean, nullable=False)
    vfge = Column(String(50), nullable=True)
    premedicado = Column(Boolean, nullable=True)
    diagnostico_clinico_id = Column(Integer, ForeignKey("diagnosticos.id"), nullable=True)
    medico_solicitante_id = Column(Integer, ForeignKey("personal_medico.id"), nullable=True)
    tm_id = Column(Integer, ForeignKey("personal_medico.id"), nullable=True)
    tp_id = Column(Integer, ForeignKey("personal_medico.id"), nullable=True)
    secretaria_id = Column(Integer, ForeignKey("personal_medico.id"), nullable=True)
    observacion = Column(Text, nullable=True)
    
    # Relaciones
    examen_base = relationship("ExamenBase", back_populates="examen_tac")
    protocolo = relationship("ProtocoloTAC", foreign_keys=[protocolo_id])
    diagnostico_clinico = relationship("Diagnostico", foreign_keys=[diagnostico_clinico_id])
    medico_solicitante = relationship("PersonalMedico", foreign_keys=[medico_solicitante_id])
    tm = relationship("PersonalMedico", foreign_keys=[tm_id])
    tp = relationship("PersonalMedico", foreign_keys=[tp_id])
    secretaria = relationship("PersonalMedico", foreign_keys=[secretaria_id])