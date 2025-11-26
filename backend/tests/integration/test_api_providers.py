import pytest
import time

BASE_PATH = "/api/proveedores"

@pytest.fixture
def temp_provider(client):
    """Crea un proveedor temporal y lo elimina al finalizar la prueba."""
    unique_suffix = str(int(time.time() * 1000))
    body = {
        "name": f"Proveedor Temp {unique_suffix}",
        "description": "Proveedor temporal para test",
        "phone_number": "111222333",
        "contact_email": f"temp{unique_suffix}@proveedor.com",
        "address": "Ruta 123"
    }
    create_resp = client.post(f"{BASE_PATH}/", json=body)
    assert create_resp.status_code == 201
    provider_id = create_resp.json["id"]
    yield provider_id, body
    delete_resp = client.delete(f"{BASE_PATH}/{provider_id}")
    assert delete_resp.status_code in (200, 404)


def test_get_providers(client):
    response = client.get(f"{BASE_PATH}/")
    assert response.status_code == 200
    assert isinstance(response.json, list)
    assert len(response.json) >= 3
    names = {p["name"] for p in response.json}
    assert {"Proveedor Uno", "Proveedor Dos", "Proveedor Tres"}.issubset(names)


def test_get_provider_by_id(client):
    response = client.get(f"{BASE_PATH}/1")
    assert response.status_code == 200
    assert response.json["id"] == 1
    assert response.json["name"] == "Proveedor Uno"


def test_get_provider_not_found(client):
    response = client.get(f"{BASE_PATH}/999999")
    assert response.status_code == 404
    assert response.json["error"].lower().startswith("provider")


def test_create_and_fetch_temp_provider(client, temp_provider):
    provider_id, body = temp_provider
    get_resp = client.get(f"{BASE_PATH}/{provider_id}")
    assert get_resp.status_code == 200
    assert get_resp.json["name"] == body["name"]
    assert get_resp.json["contact_email"] == body["contact_email"]


def test_create_provider_duplicate(client):
    body = {
        "name": "Proveedor Uno",
        "description": "Otro intento",
        "phone_number": "123456789",
        "contact_email": "contacto1@proveedor.com",
        "address": "Calle Falsa 123, Ciudad"
    }
    response = client.post(f"{BASE_PATH}/", json=body)
    assert response.status_code == 409
    assert "existe" in response.json["error"].lower()


def test_delete_temp_provider(client, temp_provider):
    provider_id, _ = temp_provider
    delete_resp = client.delete(f"{BASE_PATH}/{provider_id}")
    assert delete_resp.status_code == 200
    assert "eliminado" in delete_resp.json["message"].lower()
    get_resp = client.get(f"{BASE_PATH}/{provider_id}")
    assert get_resp.status_code == 404
