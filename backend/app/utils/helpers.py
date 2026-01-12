from datetime import date

def extraer_mes_anio(fecha: date) -> tuple[int, int]:
    """Extraer mes y año de una fecha"""
    return fecha.month, fecha.year

def limpiar_rut(rut: str) -> str:
    """Limpiar RUT removiendo puntos y guión"""
    return rut.replace(".", "").replace("-", "")