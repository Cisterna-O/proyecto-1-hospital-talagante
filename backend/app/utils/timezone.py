from datetime import datetime
import pytz

CHILE_TZ = pytz.timezone('America/Santiago')

def get_chile_time() -> datetime:
    """Obtener datetime actual en zona horaria de Chile"""
    return datetime.now(CHILE_TZ)

def to_chile_time(dt: datetime) -> datetime:
    """Convertir datetime UTC a Chile"""
    if dt.tzinfo is None:
        dt = pytz.utc.localize(dt)
    return dt.astimezone(CHILE_TZ)

def format_chile_datetime(dt: datetime) -> str:
    """Formatear datetime en formato chileno"""
    chile_dt = to_chile_time(dt) if dt.tzinfo else CHILE_TZ.localize(dt)
    return chile_dt.strftime("%d/%m/%Y %H:%M:%S")