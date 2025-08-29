from flask import Flask

from src.accounting.routes.accounting_routes import accounting_bp
from src.configuration.routes.config_routes import config_bp
from src.products.routes.products_routes import products_bp
from src.providers.routes.providers_routes import providers_bp
from src.sales.routes.sales_routes import sales_bp
from src.users.routes.users_routes import users_bp

from minio_storage import minio_service

app = Flask(__name__)

# register blueprints
app.register_blueprint(accounting_bp)
app.register_blueprint(config_bp)
app.register_blueprint(products_bp)
app.register_blueprint(providers_bp)
app.register_blueprint(sales_bp)
app.register_blueprint(users_bp)


if __name__ == "__main__":
    app.run(debug=True,host="0.0.0.0",port=5000)