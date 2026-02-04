from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
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
def exportar_excel(
    anio: Optional[int] = None,
    mes: Optional[int] = None,
    fecha_inicio: Optional[date] = None,
    fecha_fin: Optional[date] = None,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Exporta todos los exámenes a Excel con 3 hojas separadas
    """
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill, Alignment
    from io import BytesIO
    from fastapi.responses import StreamingResponse
    
    wb = Workbook()
    wb.remove(wb.active)
    
    # Construir query base
    query_tac = db.query(ExamenBase).join(ExamenTAC).options(
        joinedload(ExamenBase.paciente),
        joinedload(ExamenBase.prevision),
        joinedload(ExamenBase.procedencia),
        joinedload(ExamenBase.codigo_mai),
        joinedload(ExamenBase.examen_especifico)
    ).filter(ExamenBase.tipo_examen == "TAC", ExamenBase.deleted_at.is_(None))
    
    query_rx = db.query(ExamenBase).join(ExamenRX).options(
        joinedload(ExamenBase.paciente),
        joinedload(ExamenBase.prevision),
        joinedload(ExamenBase.procedencia),
        joinedload(ExamenBase.codigo_mai),
        joinedload(ExamenBase.examen_especifico)
    ).filter(ExamenBase.tipo_examen == "RX", ExamenBase.deleted_at.is_(None))
    
    query_eco = db.query(ExamenBase).join(ExamenECO).options(
        joinedload(ExamenBase.paciente),
        joinedload(ExamenBase.prevision),
        joinedload(ExamenBase.procedencia),
        joinedload(ExamenBase.codigo_mai),
        joinedload(ExamenBase.examen_especifico)
    ).filter(ExamenBase.tipo_examen == "ECO", ExamenBase.deleted_at.is_(None))
    
    # Aplicar filtros
    if anio:
        query_tac = query_tac.filter(ExamenBase.anio_realizacion == anio)
        query_rx = query_rx.filter(ExamenBase.anio_realizacion == anio)
        query_eco = query_eco.filter(ExamenBase.anio_realizacion == anio)
    
    if mes:
        query_tac = query_tac.filter(ExamenBase.mes_realizacion == mes)
        query_rx = query_rx.filter(ExamenBase.mes_realizacion == mes)
        query_eco = query_eco.filter(ExamenBase.mes_realizacion == mes)
    
    if fecha_inicio:
        query_tac = query_tac.filter(ExamenBase.fecha_realizacion >= fecha_inicio)
        query_rx = query_rx.filter(ExamenBase.fecha_realizacion >= fecha_inicio)
        query_eco = query_eco.filter(ExamenBase.fecha_realizacion >= fecha_inicio)
    
    if fecha_fin:
        query_tac = query_tac.filter(ExamenBase.fecha_realizacion <= fecha_fin)
        query_rx = query_rx.filter(ExamenBase.fecha_realizacion <= fecha_fin)
        query_eco = query_eco.filter(ExamenBase.fecha_realizacion <= fecha_fin)
    
    examenes_tac = query_tac.all()
    examenes_rx = query_rx.all()
    examenes_eco = query_eco.all()
    
    # Estilos
    header_fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
    header_font = Font(bold=True, color="FFFFFF")
    
    # ============= HOJA TAC =============
    ws_tac = wb.create_sheet(title="TAC")
    
    # Encabezados TAC
    headers_tac = [
        "ID", "Fecha Realización", "Fecha Solicitud", "Hora", "Nombre", "RUT",
        "F/Nac", "Edad", "Previsión", "Atención", "Procedencia", "Externo",
        "Examen", "Código", "Protocolo", "Cód.ACV", "GES", "M.Contraste",
        "VFGE", "Premedicado", "Diagnóstico", "Médico Sol.", "TM", "Contrato",
        "TP", "Secretaria", "Observación", "Creado el"
    ]
    
    ws_tac.append(headers_tac)
    
    # Aplicar estilo al encabezado
    for cell in ws_tac[1]:
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center")
    
    # Datos TAC
    for examen_base in examenes_tac:
        examen_tac = db.query(ExamenTAC).options(
            joinedload(ExamenTAC.protocolo),
            joinedload(ExamenTAC.diagnostico_clinico),
            joinedload(ExamenTAC.medico_solicitante),
            joinedload(ExamenTAC.tm),
            joinedload(ExamenTAC.tp),
            joinedload(ExamenTAC.secretaria)
        ).filter(ExamenTAC.examen_base_id == examen_base.id).first()
        
        row = [
            examen_base.id,
            examen_base.fecha_realizacion.strftime('%Y-%m-%d') if examen_base.fecha_realizacion else '',
            examen_tac.fecha_solicitud.strftime('%Y-%m-%d') if examen_tac.fecha_solicitud else '',
            str(examen_tac.hora_realizacion) if examen_tac.hora_realizacion else '',
            examen_base.paciente.nombre_completo if examen_base.paciente else '',
            examen_base.paciente.rut if examen_base.paciente else '',
            examen_base.paciente.fecha_nacimiento.strftime('%Y-%m-%d') if examen_base.paciente and examen_base.paciente.fecha_nacimiento else '',
            examen_tac.edad if examen_tac.edad else '',
            examen_base.prevision.nombre if examen_base.prevision else '',
            examen_base.atencion,
            examen_base.procedencia.nombre if examen_base.procedencia else '',
            examen_tac.externo if examen_tac.externo else '',
            examen_base.examen_especifico.nombre if examen_base.examen_especifico else '',
            examen_base.codigo_mai.codigo if examen_base.codigo_mai else '',
            examen_tac.protocolo.nombre if examen_tac.protocolo else '',
            'Sí' if examen_tac.cod_acv else 'No',
            'Sí' if examen_tac.ges else 'No',
            'Sí' if examen_tac.medio_contraste else 'No',
            examen_tac.vfge if examen_tac.vfge else '',
            'Sí' if examen_tac.premedicado else ('No' if examen_tac.premedicado is False else ''),
            examen_tac.diagnostico_clinico.nombre if examen_tac.diagnostico_clinico else '',
            examen_tac.medico_solicitante.nombre if examen_tac.medico_solicitante else '',
            examen_tac.tm.nombre if examen_tac.tm else '',
            examen_base.contrato if examen_base.contrato else '',
            examen_tac.tp.nombre if examen_tac.tp else '',
            examen_tac.secretaria.nombre if examen_tac.secretaria else '',
            examen_tac.observacion if examen_tac.observacion else '',
            examen_base.created_at.strftime('%Y-%m-%d %H:%M') if examen_base.created_at else ''
        ]
        
        ws_tac.append(row)
    
    # ============= HOJA RX =============
    ws_rx = wb.create_sheet(title="RX")
    
    headers_rx = [
        "ID", "Fecha", "Atención", "Previsión", "Procedencia", "RUT", "Nombre",
        "Examen", "Código", "Hora", "TM/TP", "Contrato", "Creado el"
    ]
    
    ws_rx.append(headers_rx)
    
    for cell in ws_rx[1]:
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center")
    
    for examen_base in examenes_rx:
        examen_rx = db.query(ExamenRX).options(
            joinedload(ExamenRX.tm_tp)
        ).filter(ExamenRX.examen_base_id == examen_base.id).first()
        
        row = [
            examen_base.id,
            examen_base.fecha_realizacion.strftime('%Y-%m-%d') if examen_base.fecha_realizacion else '',
            examen_base.atencion,
            examen_base.prevision.nombre if examen_base.prevision else '',
            examen_base.procedencia.nombre if examen_base.procedencia else '',
            examen_base.paciente.rut if examen_base.paciente else '',
            examen_base.paciente.nombre_completo if examen_base.paciente else '',
            examen_base.examen_especifico.nombre if examen_base.examen_especifico else '',
            examen_base.codigo_mai.codigo if examen_base.codigo_mai else '',
            str(examen_rx.hora_realizacion) if examen_rx.hora_realizacion else '',
            examen_rx.tm_tp.nombre if examen_rx.tm_tp else '',
            examen_base.contrato if examen_base.contrato else '',
            examen_base.created_at.strftime('%Y-%m-%d %H:%M') if examen_base.created_at else ''
        ]
        
        ws_rx.append(row)
    
    # ============= HOJA ECO =============
    ws_eco = wb.create_sheet(title="ECO")
    
    headers_eco = [
        "ID", "Fecha", "Mes", "RUT", "Nombre", "Atención", "Previsión",
        "Código", "Examen", "Diagnóstico", "Procedencia", "Realizado",
        "Contrato", "Transcribe", "Creado el"
    ]
    
    ws_eco.append(headers_eco)
    
    for cell in ws_eco[1]:
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center")
    
    for examen_base in examenes_eco:
        examen_eco = db.query(ExamenECO).options(
            joinedload(ExamenECO.diagnostico),
            joinedload(ExamenECO.realizado),
            joinedload(ExamenECO.transcribe)
        ).filter(ExamenECO.examen_base_id == examen_base.id).first()
        
        row = [
            examen_base.id,
            examen_base.fecha_realizacion.strftime('%Y-%m-%d') if examen_base.fecha_realizacion else '',
            examen_base.mes_realizacion,
            examen_base.paciente.rut if examen_base.paciente else '',
            examen_base.paciente.nombre_completo if examen_base.paciente else '',
            examen_base.atencion,
            examen_base.prevision.nombre if examen_base.prevision else '',
            examen_base.codigo_mai.codigo if examen_base.codigo_mai else '',
            examen_base.examen_especifico.nombre if examen_base.examen_especifico else '',
            examen_eco.diagnostico.nombre if examen_eco.diagnostico else '',
            examen_base.procedencia.nombre if examen_base.procedencia else '',
            examen_eco.realizado.nombre if examen_eco.realizado else '',
            examen_base.contrato if examen_base.contrato else '',
            examen_eco.transcribe.nombre if examen_eco.transcribe else '',
            examen_base.created_at.strftime('%Y-%m-%d %H:%M') if examen_base.created_at else ''
        ]
        
        ws_eco.append(row)
    
    # Ajustar anchos de columna para todas las hojas
    for ws in [ws_tac, ws_rx, ws_eco]:
        for column_cells in ws.columns:
            max_length = 0
            column_letter = column_cells[0].column_letter
            for cell in column_cells:
                try:
                    if cell.value:
                        max_length = max(max_length, len(str(cell.value)))
                except:
                    pass
            adjusted_width = min(max_length + 2, 50)
            ws.column_dimensions[column_letter].width = adjusted_width
    
    # Guardar en memoria
    output = BytesIO()
    wb.save(output)
    output.seek(0)
    
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f"attachment; filename=examenes_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        }
    )