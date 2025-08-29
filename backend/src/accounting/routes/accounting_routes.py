from flask import Blueprint, jsonify

accounting_bp = Blueprint("accounting", __name__, url_prefix="/contabilidad")

@accounting_bp.route("/", methods=["GET"])
def get_accountings():
    return jsonify({"Modulo de contabilidad": "En construccion"}), 200