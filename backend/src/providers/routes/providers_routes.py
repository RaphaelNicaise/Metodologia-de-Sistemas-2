from flask import Blueprint, jsonify, request

from providers.services.provider_service import ProviderService

providers_bp = Blueprint("providers", __name__, url_prefix="/proveedores")
p_service = ProviderService()

@providers_bp.route("/", methods=["GET"])
def get_providers():
    providers = p_service.get_providers()
    return jsonify([provider.to_dict() for provider in providers]), 200

@providers_bp.route("/<int:provider_id>", methods=["GET"])
def get_provider(provider_id):
    provider = p_service.get_provider_by_id(provider_id)
    if provider:
        return jsonify(provider.to_dict()), 200
    return jsonify({"error": "Provider not found"}), 404

@providers_bp.route("/", methods=["POST"])
def create_provider():
    data = request.get_json()
    result = p_service.create_provider(data)

    if isinstance(result, dict) and result.get("error") == "DUPLICATE":
        return jsonify({"error": "El proveedor ya existe"}), 409

    if not result or (isinstance(result, dict) and "error" in result):
        return jsonify({"error": "Error al crear proveedor"}), 400
    
    return jsonify(result.to_dict()), 201