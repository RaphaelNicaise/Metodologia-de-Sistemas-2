from flask import Flask

from src.accounting.routes import accounting_bp
from src.configuration.routes.config_routes import config_bp
from src.products.routes.products_routes import products_bp
from src.providers.routes.providers_routes import providers_bp
from src.sales.routes.sales_routes import sales_bp
from src.users.routes.users_routes import users_bp
from flask_cors import CORS

from src.minio_storage.minio_service import MinioClient
from src.db import Database

def create_app(testing: bool = False): # Funcion que usa patron factory

     app = Flask(__name__)

     if testing:
          app.config["TESTING"] = True
          app.config["DEBUG"] = True
     else:
          app.config["TESTING"] = False
          app.config["DEBUG"] = False

     # inicializar servicios singleton con el patron builder
     Database(testing=testing)  # instancia del cliente de MySQL
     if not testing:
          MinioClient() # instancia el singleton de MinIO

     CORS(app)

     # register blueprints
     app.register_blueprint(accounting_bp, url_prefix="/api/contabilidad")
     app.register_blueprint(config_bp)
     app.register_blueprint(products_bp, url_prefix="/api/productos")
     app.register_blueprint(providers_bp, url_prefix="/api/proveedores")
     app.register_blueprint(sales_bp)
     app.register_blueprint(users_bp)

     return app

if __name__ == "__main__":
     app = create_app()
     app.run(debug=True, host="0.0.0.0", port=5000)