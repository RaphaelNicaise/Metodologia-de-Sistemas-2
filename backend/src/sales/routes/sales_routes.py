from flask import Blueprint, jsonify

sales_bp = Blueprint("sales", __name__, url_prefix="/ventas")

@sales_bp.route("/", methods=["GET"])
def get_sales():
    return jsonify({"Modulo de productos": "En construccion"}), 200
