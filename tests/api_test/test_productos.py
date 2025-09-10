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