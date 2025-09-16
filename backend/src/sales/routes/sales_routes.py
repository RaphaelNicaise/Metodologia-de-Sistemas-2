# src/sales/routes/sales_routes.py
# Este archivo define el Blueprint y engancha las rutas a los controllers.

from flask import Blueprint
from ..controllers import sales_controller as saleController

bp = Blueprint("sales", __name__)

# POST /api/sales
bp.add_url_rule(
    "/",
    view_func=saleController.createSale,
    methods=["POST"]
)
