from flask import Blueprint, jsonify, request
import os
import uuid
from werkzeug.utils import secure_filename

from src.products.services.products_service import ProductoService
from src.products.services.stock_service import StockService

products_bp = Blueprint("products", __name__)
p_service = ProductoService()
s_service = StockService()

UPLOAD_FOLDER = '/app/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@products_bp.route("/", methods=["GET"])
def get_products():
    products = p_service.get_all_products()
    return jsonify([product.to_dict() for product in products]), 200

@products_bp.route("/<int:product_id>", methods=["GET"])
def get_product(product_id):
    product = p_service.get_product_by_id(product_id)
    if product:
        return jsonify(product.to_dict()), 200
    return jsonify({"error": "Product not found"}), 404

@products_bp.route("/", methods=["POST"])
def create_product():
    data = request.get_json()
    result = p_service.create_product(data)

    if isinstance(result, dict) and result.get("error") == "DUPLICATE":
        return jsonify({"error": "El producto ya existe"}), 409

    if not result or (isinstance(result, dict) and "error" in result):
        return jsonify({"error": "Error al crear producto"}), 400
    
    return jsonify(result.to_dict()), 201 # devuelve el producto creado con su ID

@products_bp.route("/upload-image", methods=["POST"])
def upload_image():
    """Endpoint para subir imágenes de productos"""
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No se envió ninguna imagen"}), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({"error": "Nombre de archivo vacío"}), 400
        
        if not allowed_file(file.filename):
            return jsonify({"error": "Tipo de archivo no permitido"}), 400
        
        # Crear carpeta uploads si no existe
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        
        # Generar nombre único
        extension = file.filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4()}.{extension}"
        filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
        
        # Guardar archivo
        file.save(filepath)
        
        # Retornar URL relativa
        image_url = f"/uploads/{unique_filename}"
        
        return jsonify({"url": image_url}), 200
        
    except Exception as e:
        return jsonify({"error": f"Error al subir imagen: {str(e)}"}), 500


@products_bp.route("/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    data = request.get_json()
    result = p_service.update_product(product_id, data)

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
    result = p_service.delete_product(product_id)

    if result == "DELETED":
        return jsonify({"message": "Producto eliminado"}), 200
    elif result == "NOT_FOUND":
        return jsonify({"error": "Producto no encontrado"}), 404
    else:  # result == "ERROR"
        return jsonify({"error": "Error al eliminar producto"}), 500
    
# stock

@products_bp.route("/<int:product_id>/stock", methods=["POST"])
def add_stock(product_id):
    data = request.get_json()
    quantity = data.get("quantity")
    user_id = data.get("user_id")
    provider_id = data.get("provider_id")
    notes = data.get("notes")

    result = s_service.add_stock(product_id, quantity, user_id, provider_id, notes)

    if result == "INVALID_QUANTITY":
        return jsonify({"error": "Cantidad inválida"}), 400
    elif result == "NOT_FOUND":
        return jsonify({"error": "Producto no encontrado"}), 404
    elif result == "ERROR":
        return jsonify({"error": "Error al agregar stock"}), 500

    return jsonify({"message": f"Se agregaron {quantity} unidades al stock"}), 200

@products_bp.route("/<int:product_id>/stock", methods=["GET"])
def get_stock_movements(product_id):
    result = s_service.get_movements(product_id)

    if result == "NOT_FOUND":
        return jsonify({"error": "Producto no encontrado"}), 404

    return jsonify(result), 200