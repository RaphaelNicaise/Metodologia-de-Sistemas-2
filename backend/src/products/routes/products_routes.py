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
    result = service.create_product(data)

    if isinstance(result, dict) and result.get("error") == "DUPLICATE":
        return jsonify({"error": "El producto ya existe"}), 409

    if not result or (isinstance(result, dict) and "error" in result):
        return jsonify({"error": "Error al crear producto"}), 400
    
    return jsonify(result.to_dict()), 201 # devuelve el producto creado con su ID


@products_bp.route("/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    data = request.get_json()
    result = service.update_product(product_id, data)

    if result == "NOT_FOUND":
        return jsonify({"error": "Producto no encontrado"}), 404
    elif result == "DUPLICATE":
        return jsonify({"error": "El nombre del producto ya existe"}), 409
    elif result == "ERROR":
        return jsonify({"error": "Error al actualizar producto"}), 500

    # Actualización exitosa
    return jsonify(result.to_dict()), 200

@products_bp.route("/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    result = service.delete_product(product_id)

    if result == "DELETED":
        return jsonify({"message": "Producto eliminado"}), 200
    elif result == "NOT_FOUND":
        return jsonify({"error": "Producto no encontrado"}), 404
    else:  # result == "ERROR"
        return jsonify({"error": "Error al eliminar producto"}), 500