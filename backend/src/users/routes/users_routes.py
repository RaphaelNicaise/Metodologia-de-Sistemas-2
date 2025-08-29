from flask import Blueprint, jsonify

users_bp = Blueprint("users", __name__, url_prefix="/usuarios")

@users_bp.route("/", methods=["GET"])
def get_users():
    return jsonify({"Modulo de users": "En construccion"}), 200
