import re
from datetime import date

def validar_rut_chileno(rut: str) -> bool:
    """
    Validar RUT chileno con dígito verificador
    Formato: 12345678-9 o 123456789
    """
    # Limpiar RUT
    rut = rut.replace(".", "").replace("-", "").upper()
    
    if len(rut) < 8:
        return False
    
    # Separar número y dígito verificador
    rut_numeros = rut[:-1]
    digito_verificador = rut[-1]
    
    # Verificar que los números sean dígitos
    if not rut_numeros.isdigit():
        return False
    
    # Calcular dígito verificador
    suma = 0
    multiplo = 2
    
    for digito in reversed(rut_numeros):
        suma += int(digito) * multiplo
        multiplo += 1
        if multiplo == 8:
            multiplo = 2
    
    resto = suma % 11
    dv_calculado = 11 - resto
    
    # Convertir a string
    if dv_calculado == 11:
        dv_calculado = "0"
    elif dv_calculado == 10:
        dv_calculado = "K"
    else:
        dv_calculado = str(dv_calculado)
    
    return digito_verificador == dv_calculado

def formatear_rut(rut: str) -> str:
    """
    Formatear RUT: 12345678-9
    """
    rut = rut.replace(".", "").replace("-", "")
    return f"{rut[:-1]}-{rut[-1]}"

def calcular_edad(fecha_nacimiento: date, fecha_referencia: date = None) -> int:
    """Calcular edad en años"""
    if fecha_referencia is None:
        fecha_referencia = date.today()
    
    edad = fecha_referencia.year - fecha_nacimiento.year
    
    # Ajustar si aún no ha cumplido años este año
    if fecha_referencia.month < fecha_nacimiento.month or \
       (fecha_referencia.month == fecha_nacimiento.month and fecha_referencia.day < fecha_nacimiento.day):
        edad -= 1
    
    return edad