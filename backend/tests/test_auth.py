import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_login_correcto():
    response = client.post("/api/auth/login", json={
        "email": "admin@hospital.cl",
        "password": "Admin123!"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_incorrecto():
    response = client.post("/api/auth/login", json={
        "email": "admin@hospital.cl",
        "password": "wrong"
    })
    assert response.status_code == 401

def test_registro_admin_sin_clave():
    response = client.post("/api/auth/register-admin", json={
        "rut": "12345678-9",
        "nombre": "Test Admin",
        "email": "test@test.cl",
        "password": "Test123!",
        "admin_secret": "wrong"
    })
    assert response.status_code == 403