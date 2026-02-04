from app.models.examen_tac import ExamenTAC
from app.models.examen_rx import ExamenRX
from app.models.examen_eco import ExamenECO
from app.models.examen_base import ExamenBase

print("Columnas Base:")
for col in ExamenBase.__table__.columns:
    print(f"  - {col.name}")

print("Columnas de ExamenTAC:")
for col in ExamenTAC.__table__.columns:
    print(f"  - {col.name}")

print("\nColumnas de ExamenRX:")
for col in ExamenRX.__table__.columns:
    print(f"  - {col.name}")

print("\nColumnas de ExamenECO:")
for col in ExamenECO.__table__.columns:
    print(f"  - {col.name}")
