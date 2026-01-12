from sqlalchemy import Column, Integer, String, Boolean, Text
from sqlalchemy.orm import relationship
from ..database import Base

class Prevision(Base):
    __tablename__ = "previsiones"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), unique=True, nullable=False)
    activo = Column(Boolean, default=True)
    
    examenes = relationship("ExamenBase", back_populates="prevision")

class Procedencia(Base):
    __tablename__ = "procedencias"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), unique=True, nullable=False)
    activo = Column(Boolean, default=True)
    
    examenes = relationship("ExamenBase", back_populates="procedencia")

class CodigoMAI(Base):
    __tablename__ = "codigos_mai"
    
    id = Column(Integer, primary_key=True, index=True)
    tipo_examen = Column(String(10), nullable=False, index=True)  # TAC, RX, ECO
    codigo = Column(String(20), nullable=False)
    descripcion = Column(Text, nullable=False)
    activo = Column(Boolean, default=True)
    
    examenes = relationship("ExamenBase", back_populates="codigo_mai")

class ProtocoloTAC(Base):
    __tablename__ = "protocolos_tac"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), unique=True, nullable=False)
    activo = Column(Boolean, default=True)
    
    examenes_tac = relationship("ExamenTAC", back_populates="protocolo")

class Diagnostico(Base):
    __tablename__ = "diagnosticos"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(Text, unique=True, nullable=False)
    activo = Column(Boolean, default=True)
    
    examenes_tac = relationship("ExamenTAC", back_populates="diagnostico_clinico")
    examenes_eco = relationship("ExamenECO", back_populates="diagnostico")

class PersonalMedico(Base):
    __tablename__ = "personal_medico"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False)
    tipo = Column(String(50), nullable=False, index=True)  # TM, TP, MEDICO, SECRETARIA, GENERAL
    activo = Column(Boolean, default=True)