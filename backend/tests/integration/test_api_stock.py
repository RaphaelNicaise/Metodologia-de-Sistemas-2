import pytest

def test_add_stock_invalid_quantity(client):
    # Producto 1 existe en la DB de prueba
    body = {"quantity": 0}
    response = client.post("/api/productos/1/stock", json=body)

    assert response.status_code == 400
    assert response.json["error"] == "Cantidad inválida"

def test_add_stock_not_found(client):
    body = {"quantity": 5}
    response = client.post("/api/productos/9999/stock", json=body)

    assert response.status_code == 404
    assert response.json["error"] == "Producto no encontrado"

def test_add_stock_ok(client):
    body = {
        "quantity": 10,
        "user_id": 1,
        "provider_id": None,
        "notes": "Movimiento test"
    }
    response = client.post("/api/productos/1/stock", json=body)

    assert response.status_code == 200
    assert "Se agregaron 10 unidades" in response.json["message"]

def test_get_stock_movements_ok(client):
    # Primero agregamos stock para generar movimiento
    # Ahora pedimos los movimientos
    response = client.get("/api/productos/1/stock")

    assert response.status_code == 200
    data = response.json
    assert isinstance(data, list)
    assert data[0]["movement_type"] == "ingreso"
    assert data[0]["quantity"] == 10
    assert data[0]["notes"] == "Movimiento test"


def test_get_stock_movements_not_found(client):
    response = client.get("/api/productos/9999/stock")

    assert response.status_code == 404
    assert response.json["error"] == "Producto no encontrado"
