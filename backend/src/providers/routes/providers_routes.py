from flask import Blueprint, jsonify

providers_bp = Blueprint("providers", __name__, url_prefix="/proveedores")

@providers_bp.route("/", methods=["GET"])
def get_providers():
    return jsonify({"Modulo de proveedores": "En construccion"}), 200
