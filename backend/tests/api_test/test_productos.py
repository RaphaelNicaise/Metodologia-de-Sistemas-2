# En ./tests/api_test/test_productos.py
import sys
sys.path.insert(0, "/app")  # Apunta al código montado en /app

import pytest
from src.app import create_app

@pytest.fixture
def client():
    app = create_app(testing=True)
    with app.test_client() as client:
        yield client

def test_get_products(client):
    response = client.get("/api/productos/")
    assert response.status_code == 200
    assert isinstance(response.json, list)

def test_get_product_by_id(client):
    response = client.get("/api/productos/1")
    assert response.status_code == 200
    assert response.json["id"] == 1
    assert response.json["name"] == "Producto A"

def test_post_product_existente(client):
    body = {
    "name": "Auriculares Bluetooth",
    "barcode": "1234567890123",
    "price": 59.99,
    "stock": 25,
    "url_image": "",
    "category": "Tecnologia"
    }

    response = client.post("/api/productos/", json=body)
    assert response.status_code == 409

def test_post_product_nuevo(client):
    body = {
    "name": "Nuevo Producto Test",
    "barcode": "9876543210987",
    "price": 19.99,
    "stock": 50,
    "url_image": "",
    "category": "Test"
    }

    response = client.post("/api/productos/", json=body)
    assert response.status_code == 201
    assert response.json["name"] == "Nuevo Producto Test"
    assert response.json["barcode"] == "9876543210987"
    global new_product_id
    new_product_id = response.json["id"]  # Guardar el ID para pruebas posteriores

def test_delete_product(client):
    
    response = client.delete(f"/api/productos/{new_product_id}")
    assert response.status_code == 200
    assert response.json["message"] == "Producto eliminado"

