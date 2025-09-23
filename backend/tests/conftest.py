import pytest
import sys
sys.path.insert(0, "/app")  # Apunta al código montado en /app
from src.app import create_app

@pytest.fixture
def client():
    app = create_app(testing=True)
    with app.test_client() as client:
        yield client