def test_grafico_obligatorio(auth_token):
    response = client.get("/api/graficos/codigo-atencion-mes-actual/TAC",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
    assert "titulo" in response.json()
    assert "tabla" in response.json()
    assert "estadisticas" in response.json()

def test_grafico_opcional(auth_token):
    response = client.get("/api/graficos/mes-atencion-anio/TAC?anio=2024",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200