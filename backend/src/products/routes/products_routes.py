from flask import Blueprint, jsonify, request

from products.services.products_service import ProductoService

products_bp = Blueprint("products", __name__)
service = ProductoService()

@products_bp.route("/", methods=["GET"])
def get_products():
    products = service.get_all_products()
    return jsonify([product.to_dict() for product in products]), 200

@products_bp.route("/<int:product_id>", methods=["GET"])
def get_product(product_id):
    product = service.get_product_by_id(product_id)
    if product:
        return jsonify(product.to_dict()), 200
    return jsonify({"error": "Product not found"}), 404

@products_bp.route("/", methods=["POST"])
def create_product():
    data = request.get_json()
    product = service.create_product(data)
    if product:
        return jsonify(product.to_dict()), 201
    return jsonify({"error": "Failed to create product"}), 400

# Rutas para actualizar y eliminar