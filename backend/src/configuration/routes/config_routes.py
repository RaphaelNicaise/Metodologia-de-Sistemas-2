from flask import Blueprint, jsonify

config_bp = Blueprint("configuration", __name__, url_prefix="/configuracion")

@config_bp.route("/", methods=["GET"])
def get_config():
    return jsonify({"Modulo de configuracion": "En construccion"}), 200
