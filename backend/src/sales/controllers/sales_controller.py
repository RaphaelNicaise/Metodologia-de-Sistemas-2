# src/sales/controllers/sales_controller.py
# Controladores: reciben HTTP, llaman a services y devuelven JSON.

from flask import request, jsonify
from ..services.sales_service import (
    crearVenta
)

def createSale():
    try:
        data = request.get_json(force=True) or {}
        venta = crearVenta(data)
        return jsonify(venta), 201
    except ValueError as e:
        # Errores de validación simples
        return jsonify({"error": str(e)}), 400
    except Exception:
        # Logueá e en producción
        return jsonify({"error": "internal_error"}), 500

# ====================================================================