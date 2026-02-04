def test_crear_examen_tac(auth_token):
    response = client.post("/api/examenes/tac", 
        headers={"Authorization": f"Bearer {auth_token}"},
        json={
            "tipo_examen": "TAC",
            "fecha_realizacion": "2024-01-15",
            "atencion": "Cerrada",
            "prevision_id": 1,
            "procedencia_id": 1,
            "paciente_rut": "12345678-9",
            "paciente_nombre": "Test Paciente",
            "examen_especifico_id": 1,
            "codigo_mai_id": 1,
            "contrato": "Institucional",
            "fecha_solicitud": "2024-01-14",
            "hora_realizacion": "14:30",
            "cod_acv": False,
            "ges": False,
            "medio_contraste": False
        }
    )
    assert response.status_code == 201

def test_listar_examenes(auth_token):
    response = client.get("/api/examenes/tac",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)