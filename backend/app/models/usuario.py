from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Usuario(Base):
    __tablename__ = "usuarios"
    
    id = Column(Integer, primary_key=True, index=True)
    rut = Column(String(12), unique=True, nullable=False, index=True)
    nombre = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    celular = Column(String(20))
    password_hash = Column(String(255), nullable=False)
    rol = Column(String(20), nullable=False)  # ingresador, administrador
    activo = Column(Boolean, default=True)
    debe_cambiar_password = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    examenes_creados = relationship("ExamenBase", foreign_keys="ExamenBase.created_by", back_populates="creador")
    examenes_modificados = relationship("ExamenBase", foreign_keys="ExamenBase.updated_by", back_populates="modificador")