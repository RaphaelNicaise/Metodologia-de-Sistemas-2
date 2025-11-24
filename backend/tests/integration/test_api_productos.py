import pytest

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
    "name": "Producto A",
    "barcode": "253457892345",
    "price": 19.99,
    "stock": 100,
    "url_image": "NULL",
    "category": "'Alimentos'"
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

