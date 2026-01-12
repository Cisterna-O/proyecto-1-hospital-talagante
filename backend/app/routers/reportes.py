from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, and_
from typing import List, Optional, Dict, Any
from datetime import date, datetime
from collections import defaultdict
from fastapi.responses import StreamingResponse
import pandas as pd
from io import BytesIO
from datetime import datetime

from ..database import get_db
from ..models.usuario import Usuario
from ..models.paciente import Paciente
from ..models.examen_base import ExamenBase
from ..models.examen_tac import ExamenTAC
from ..models.examen_rx import ExamenRX
from ..models.examen_eco import ExamenECO
from ..models.catalogos import PersonalMedico
from ..middleware.auth_middleware import get_current_user, require_admin, require_ingresador_o_admin
from ..utils.helpers import limpiar_rut

router = APIRouter()

# ============================================
# ESTADÍSTICAS GENERALES
# ============================================

@router.get("/estadisticas-generales")
def estadisticas_generales(
    fecha_inicio: Optional[date] = None,
    fecha_fin: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Estadísticas generales del sistema
    
    Retorna:
    - Total de exámenes por tipo
    - Total de pacientes únicos
    - Promedio de exámenes por día
    - Distribución por tipo de atención
    """
    
    # Query base
    query = db.query(ExamenBase).filter(ExamenBase.deleted_at.is_(None))
    
    # Aplicar filtros de fecha
    if fecha_inicio:
        query = query.filter(ExamenBase.fecha_realizacion >= fecha_inicio)
    if fecha_fin:
        query = query.filter(ExamenBase.fecha_realizacion <= fecha_fin)
    
    # Total de exámenes por tipo
    examenes_por_tipo = db.query(
        ExamenBase.tipo_examen,
        func.count(ExamenBase.id).label('total')
    ).filter(ExamenBase.deleted_at.is_(None))
    
    if fecha_inicio:
        examenes_por_tipo = examenes_por_tipo.filter(ExamenBase.fecha_realizacion >= fecha_inicio)
    if fecha_fin:
        examenes_por_tipo = examenes_por_tipo.filter(ExamenBase.fecha_realizacion <= fecha_fin)
    
    examenes_por_tipo = examenes_por_tipo.group_by(ExamenBase.tipo_examen).all()
    
    # Total de pacientes únicos
    pacientes_unicos = query.with_entities(
        func.count(func.distinct(ExamenBase.paciente_id))
    ).scalar()
    
    # Distribución por atención
    por_atencion = db.query(
        ExamenBase.atencion,
        func.count(ExamenBase.id).label('total')
    ).filter(ExamenBase.deleted_at.is_(None))
    
    if fecha_inicio:
        por_atencion = por_atencion.filter(ExamenBase.fecha_realizacion >= fecha_inicio)
    if fecha_fin:
        por_atencion = por_atencion.filter(ExamenBase.fecha_realizacion <= fecha_fin)
    
    por_atencion = por_atencion.group_by(ExamenBase.atencion).all()
    
    # Construir respuesta
    return {
        "examenes_por_tipo": {
            examen.tipo_examen: examen.total 
            for examen in examenes_por_tipo
        },
        "total_examenes": sum(examen.total for examen in examenes_por_tipo),
        "pacientes_unicos": pacientes_unicos,
        "por_atencion": {
            atencion.atencion: atencion.total 
            for atencion in por_atencion
        }
    }

# ============================================
# EXÁMENES POR PERÍODO (Para gráficos de línea)
# ============================================

@router.get("/por-periodo")
def examenes_por_periodo(
    anio: int,
    tipo_examen: Optional[str] = Query(None, pattern="^(TAC|RX|ECO)$"),
    agrupar_por: str = Query("mes", pattern="^(mes|semana)$"),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Obtener cantidad de exámenes agrupados por mes o semana
    
    Útil para gráficos de línea temporal
    """
    
    query = db.query(
        ExamenBase.mes_realizacion,
        func.count(ExamenBase.id).label('total')
    ).filter(
        ExamenBase.anio_realizacion == anio,
        ExamenBase.deleted_at.is_(None)
    )
    
    if tipo_examen:
        query = query.filter(ExamenBase.tipo_examen == tipo_examen)
    
    # Agrupar por mes
    resultados = query.group_by(ExamenBase.mes_realizacion).order_by(ExamenBase.mes_realizacion).all()
    
    # Crear array con todos los meses (llenar con 0 los que no tienen datos)
    meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    datos = {mes: 0 for mes in range(1, 13)}
    
    for resultado in resultados:
        datos[resultado.mes_realizacion] = resultado.total
    
    return {
        "labels": meses,
        "data": [datos[mes] for mes in range(1, 13)],
        "anio": anio,
        "tipo_examen": tipo_examen or "Todos"
    }

# ============================================
# COMPARATIVA POR TIPO DE EXAMEN
# ============================================

@router.get("/comparativa-tipos")
def comparativa_tipos(
    anio: int,
    mes: Optional[int] = Query(None, ge=1, le=12),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Comparar cantidad de exámenes TAC vs RX vs ECO
    
    Útil para gráfico de barras comparativo
    """
    
    query = db.query(
        ExamenBase.tipo_examen,
        func.count(ExamenBase.id).label('total')
    ).filter(
        ExamenBase.anio_realizacion == anio,
        ExamenBase.deleted_at.is_(None)
    )
    
    if mes:
        query = query.filter(ExamenBase.mes_realizacion == mes)
    
    resultados = query.group_by(ExamenBase.tipo_examen).all()
    
    datos = {"TAC": 0, "RX": 0, "ECO": 0}
    for resultado in resultados:
        datos[resultado.tipo_examen] = resultado.total
    
    return {
        "labels": ["TAC", "RX", "ECO"],
        "data": [datos["TAC"], datos["RX"], datos["ECO"]],
        "periodo": f"{mes}/{anio}" if mes else str(anio)
    }

# ============================================
# EXÁMENES POR PACIENTE
# ============================================

@router.get("/por-paciente/{paciente_rut}")
def examenes_por_paciente(
    paciente_rut: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Historial completo de exámenes de un paciente
    """
    
    rut_limpio = limpiar_rut(paciente_rut)
    
    # Buscar paciente
    paciente = db.query(Paciente).filter(Paciente.rut == rut_limpio).first()
    
    if not paciente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente no encontrado"
        )
    
    # Obtener todos sus exámenes
    examenes = db.query(ExamenBase).filter(
        ExamenBase.paciente_id == paciente.id,
        ExamenBase.deleted_at.is_(None)
    ).order_by(ExamenBase.fecha_realizacion.desc()).all()
    
    # Agrupar por tipo
    por_tipo = {"TAC": 0, "RX": 0, "ECO": 0}
    historial = []
    
    for examen in examenes:
        por_tipo[examen.tipo_examen] += 1
        historial.append({
            "id": examen.id,
            "tipo": examen.tipo_examen,
            "fecha": examen.fecha_realizacion.isoformat(),
            "atencion": examen.atencion
        })
    
    return {
        "paciente": {
            "rut": paciente.rut,
            "nombre": paciente.nombre_completo,
            "fecha_nacimiento": paciente.fecha_nacimiento.isoformat() if paciente.fecha_nacimiento else None
        },
        "total_examenes": len(examenes),
        "por_tipo": por_tipo,
        "historial": historial
    }

# ============================================
# TOP MÉDICOS SOLICITANTES (Solo para TAC)
# ============================================

@router.get("/top-medicos")
def top_medicos_solicitantes(
    anio: int,
    mes: Optional[int] = Query(None, ge=1, le=12),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Top médicos que más exámenes TAC solicitan
    """
    
    query = db.query(
        PersonalMedico.nombre,
        func.count(ExamenTAC.id).label('total')
    ).join(
        ExamenTAC, PersonalMedico.id == ExamenTAC.medico_solicitante_id
    ).join(
        ExamenBase, ExamenTAC.examen_base_id == ExamenBase.id
    ).filter(
        ExamenBase.anio_realizacion == anio,
        ExamenBase.deleted_at.is_(None)
    )
    
    if mes:
        query = query.filter(ExamenBase.mes_realizacion == mes)
    
    resultados = query.group_by(PersonalMedico.nombre).order_by(
        func.count(ExamenTAC.id).desc()
    ).limit(limit).all()
    
    return {
        "labels": [r.nombre for r in resultados],
        "data": [r.total for r in resultados],
        "periodo": f"{mes}/{anio}" if mes else str(anio)
    }

# ============================================
# DISTRIBUCIÓN POR PREVISIÓN (Gráfico de torta)
# ============================================

@router.get("/por-prevision")
def examenes_por_prevision(
    anio: int,
    mes: Optional[int] = Query(None, ge=1, le=12),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Distribución de exámenes por tipo de previsión
    
    Útil para gráfico de torta/pie
    """
    
    from ..models.catalogos import Prevision
    
    query = db.query(
        Prevision.nombre,
        func.count(ExamenBase.id).label('total')
    ).join(
        ExamenBase, Prevision.id == ExamenBase.prevision_id
    ).filter(
        ExamenBase.anio_realizacion == anio,
        ExamenBase.deleted_at.is_(None)
    )
    
    if mes:
        query = query.filter(ExamenBase.mes_realizacion == mes)
    
    resultados = query.group_by(Prevision.nombre).order_by(
        func.count(ExamenBase.id).desc()
    ).all()
    
    return {
        "labels": [r.nombre for r in resultados],
        "data": [r.total for r in resultados],
        "periodo": f"{mes}/{anio}" if mes else str(anio)
    }

# ============================================
# RESUMEN MENSUAL COMPLETO
# ============================================

@router.get("/resumen-mensual")
def resumen_mensual(
    anio: int,
    mes: int = Query(..., ge=1, le=12),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Resumen completo del mes con todas las métricas
    """
    
    # Total por tipo
    por_tipo = db.query(
        ExamenBase.tipo_examen,
        func.count(ExamenBase.id).label('total')
    ).filter(
        ExamenBase.anio_realizacion == anio,
        ExamenBase.mes_realizacion == mes,
        ExamenBase.deleted_at.is_(None)
    ).group_by(ExamenBase.tipo_examen).all()
    
    # Por atención
    por_atencion = db.query(
        ExamenBase.atencion,
        func.count(ExamenBase.id).label('total')
    ).filter(
        ExamenBase.anio_realizacion == anio,
        ExamenBase.mes_realizacion == mes,
        ExamenBase.deleted_at.is_(None)
    ).group_by(ExamenBase.atencion).all()
    
    # Por contrato
    por_contrato = db.query(
        ExamenBase.contrato,
        func.count(ExamenBase.id).label('total')
    ).filter(
        ExamenBase.anio_realizacion == anio,
        ExamenBase.mes_realizacion == mes,
        ExamenBase.deleted_at.is_(None)
    ).group_by(ExamenBase.contrato).all()
    
    return {
        "periodo": f"{mes}/{anio}",
        "total_examenes": sum(t.total for t in por_tipo),
        "por_tipo": {t.tipo_examen: t.total for t in por_tipo},
        "por_atencion": {a.atencion: a.total for a in por_atencion},
        "por_contrato": {c.contrato: c.total for c in por_contrato}
    }

# ============================================
# EXPORTAR RESPALDO A EXCEL
# ============================================

@router.get("/exportar-excel")
def exportar_respaldo_excel(
    anio: Optional[int] = None,
    mes: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin)
):
    """
    Exportar todos los exámenes a Excel (solo administrador)
    
    Genera un archivo Excel con 3 hojas: TAC, RX, ECO
    Opcionalmente filtra por año/mes
    """
    
    # Query base para cada tipo
    query_base = db.query(ExamenBase).filter(ExamenBase.deleted_at.is_(None))
    
    if anio:
        query_base = query_base.filter(ExamenBase.anio_realizacion == anio)
    if mes:
        query_base = query_base.filter(ExamenBase.mes_realizacion == mes)
    
    # ============================================
    # HOJA 1: TAC
    # ============================================
    examenes_tac = query_base.filter(ExamenBase.tipo_examen == "TAC").join(
        ExamenTAC, ExamenBase.id == ExamenTAC.examen_base_id
    ).join(
        Paciente, ExamenBase.paciente_id == Paciente.id
    ).all()
    
    data_tac = []
    for examen_base in examenes_tac:
        examen_tac = examen_base.examen_tac
        paciente = examen_base.paciente
        
        data_tac.append({
            "ID": examen_base.id,
            "Fecha Realización": examen_base.fecha_realizacion.strftime("%d/%m/%Y"),
            "Fecha Solicitud": examen_tac.fecha_solicitud.strftime("%d/%m/%Y"),
            "Hora": examen_tac.hora_realizacion.strftime("%H:%M") if examen_tac.hora_realizacion else "",
            "Atención": examen_base.atencion,
            "Paciente RUT": paciente.rut,
            "Paciente Nombre": paciente.nombre_completo,
            "Edad": examen_tac.edad or "",
            "Externo": examen_tac.externo or "",
            "Cód. ACV": "Sí" if examen_tac.cod_acv else "No",
            "GES": "Sí" if examen_tac.ges else "No",
            "Medio Contraste": "Sí" if examen_tac.medio_contraste else "No",
            "VFGE": examen_tac.vfge or "",
            "Premedicado": "Sí" if examen_tac.premedicado else "No" if examen_tac.premedicado is not None else "",
            "Observación": examen_tac.observacion or "",
            "Contrato": examen_base.contrato,
            "Creado el": examen_base.created_at.strftime("%d/%m/%Y %H:%M")
        })
    
    df_tac = pd.DataFrame(data_tac)
    
    # ============================================
    # HOJA 2: RX
    # ============================================
    examenes_rx = query_base.filter(ExamenBase.tipo_examen == "RX").join(
        ExamenRX, ExamenBase.id == ExamenRX.examen_base_id
    ).join(
        Paciente, ExamenBase.paciente_id == Paciente.id
    ).all()
    
    data_rx = []
    for examen_base in examenes_rx:
        examen_rx = examen_base.examen_rx
        paciente = examen_base.paciente
        
        data_rx.append({
            "ID": examen_base.id,
            "Fecha Realización": examen_base.fecha_realizacion.strftime("%d/%m/%Y"),
            "Hora": examen_rx.hora_realizacion.strftime("%H:%M") if examen_rx.hora_realizacion else "",
            "Atención": examen_base.atencion,
            "Paciente RUT": paciente.rut,
            "Paciente Nombre": paciente.nombre_completo,
            "Contrato": examen_base.contrato,
            "Creado el": examen_base.created_at.strftime("%d/%m/%Y %H:%M")
        })
    
    df_rx = pd.DataFrame(data_rx)
    
    # ============================================
    # HOJA 3: ECO
    # ============================================
    examenes_eco = query_base.filter(ExamenBase.tipo_examen == "ECO").join(
        ExamenECO, ExamenBase.id == ExamenECO.examen_base_id
    ).join(
        Paciente, ExamenBase.paciente_id == Paciente.id
    ).all()
    
    data_eco = []
    for examen_base in examenes_eco:
        examen_eco = examen_base.examen_eco
        paciente = examen_base.paciente
        
        data_eco.append({
            "ID": examen_base.id,
            "Fecha Realización": examen_base.fecha_realizacion.strftime("%d/%m/%Y"),
            "Mes": f"{examen_base.mes_realizacion}/{examen_base.anio_realizacion}",
            "Atención": examen_base.atencion,
            "Paciente RUT": paciente.rut,
            "Paciente Nombre": paciente.nombre_completo,
            "Contrato": examen_base.contrato,
            "Creado el": examen_base.created_at.strftime("%d/%m/%Y %H:%M")
        })
    
    df_eco = pd.DataFrame(data_eco)
    
    # ============================================
    # CREAR ARCHIVO EXCEL
    # ============================================
    output = BytesIO()
    
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df_tac.to_excel(writer, sheet_name='TAC', index=False)
        df_rx.to_excel(writer, sheet_name='RX', index=False)
        df_eco.to_excel(writer, sheet_name='ECO', index=False)
    
    output.seek(0)
    
    # Nombre del archivo
    periodo = ""
    if anio and mes:
        periodo = f"_{mes}_{anio}"
    elif anio:
        periodo = f"_{anio}"
    
    filename = f"respaldo_examenes{periodo}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )