from flask import Blueprint, jsonify

products_bp = Blueprint("products", __name__, url_prefix="/productos")

@products_bp.route("/", methods=["GET"])
def get_products():
    return jsonify({"Modulo de productos": "En construccion"}), 200
