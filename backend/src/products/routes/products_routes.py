from flask import Blueprint, jsonify

from products.services.products_service import ProductoService


products_bp = Blueprint("products", __name__)
service = ProductoService()

@products_bp.route("/", methods=["GET"]) # 127.0.0.1:5000/products/
def get_products():
    products = service.get_all_products()
    return jsonify([product.to_dict() for product in products]), 200

