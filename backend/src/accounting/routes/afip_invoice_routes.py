# src/accounting/routes/afip_invoices.py

from flask import Blueprint, jsonify, request
from src.accounting.services.afip_invoices_services import AFIPInvoiceService
from datetime import datetime

afip_invoices_bp = Blueprint("afip_invoices", __name__)
service = AFIPInvoiceService()

@afip_invoices_bp.route("/", methods=["GET"])
def get_afip_invoices():
    """Obtiene todas las facturas AFIP con paginación"""
    limit = int(request.args.get("limit", 50))
    offset = int(request.args.get("offset", 0))
    invoices = service.get_all_invoices(limit, offset)
    return jsonify(invoices), 200

@afip_invoices_bp.route("/<int:invoice_id>", methods=["GET"])
def get_afip_invoice(invoice_id):
    """Obtiene una factura específica por ID"""
    invoice = service.get_invoice_by_id(invoice_id)
    if invoice:
        return jsonify(invoice), 200
    return jsonify({"error": "AFIP invoice not found"}), 404

@afip_invoices_bp.route("/", methods=["POST"])
def create_afip_invoice():
    """Crea una nueva factura AFIP"""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    invoice = service.create_invoice(data)
    if invoice:
        return jsonify(invoice), 201
    return jsonify({"error": "Failed to create AFIP invoice"}), 400

@afip_invoices_bp.route("/pending-sales", methods=["GET"])
def get_pending_sales():
    """Obtiene todas las ventas pendientes de facturación"""
    pending_sales = service.get_pending_sales()
    return jsonify(pending_sales), 200

@afip_invoices_bp.route("/type/<string:invoice_type>", methods=["GET"])
def get_invoices_by_type(invoice_type):
    """Obtiene facturas por tipo (A, B, C, etc.)"""
    invoices = service.get_invoices_by_type(invoice_type.upper())
    return jsonify(invoices), 200

@afip_invoices_bp.route("/date-range", methods=["GET"])
def get_invoices_by_date_range():
    """Obtiene facturas en un rango de fechas"""
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    
    if not start_date or not end_date:
        return jsonify({"error": "start_date and end_date are required"}), 400
    
    try:
        datetime.strptime(start_date, '%Y-%m-%d')
        datetime.strptime(end_date, '%Y-%m-%d')
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
    
    invoices = service.get_invoices_by_date_range(start_date, end_date)
    return jsonify(invoices), 200

@afip_invoices_bp.route("/expired-caes", methods=["GET"])
def get_expired_caes():
    """Obtiene facturas con CAE vencido o por vencer"""
    expired_invoices = service.get_expired_caes()
    return jsonify(expired_invoices), 200

@afip_invoices_bp.route("/bulk", methods=["POST"])
def bulk_create_invoices():
    """Crea múltiples facturas en lote"""
    data = request.get_json()
    
    if not data or not isinstance(data.get("invoices"), list):
        return jsonify({"error": "Expected 'invoices' array in request body"}), 400
    
    result = service.bulk_create_invoices(data["invoices"])
    return jsonify(result), 200

@afip_invoices_bp.route("/stats", methods=["GET"])
def get_invoicing_stats():
    """Obtiene estadísticas de facturación"""
    stats = service.get_invoicing_stats()
    return jsonify(stats), 200

@afip_invoices_bp.route("/next-number/<string:invoice_type>", methods=["GET"])
def get_next_invoice_number(invoice_type):
    """Obtiene el próximo número de factura para un tipo específico"""
    next_number = service.get_next_invoice_number(invoice_type.upper())
    return jsonify({
        "invoice_type": invoice_type.upper(),
        "next_number": next_number
    }), 200

# Endpoints adicionales para facilitar el proceso de facturación

@afip_invoices_bp.route("/quick-invoice", methods=["POST"])
def quick_invoice():
    """Crea una factura con datos mínimos (genera número automáticamente)"""
    data = request.get_json()
    
    if not data or not data.get("sale_id"):
        return jsonify({"error": "sale_id is required"}), 400
    
    # Datos por defecto si no se proporcionan
    invoice_type = data.get("invoice_type", "B")
    next_number = service.get_next_invoice_number(invoice_type)
    
    # Generar CAE ficticio (en producción vendría de AFIP)
    import uuid
    fake_cae = str(uuid.uuid4()).replace("-", "")[:14].upper()
    
    # Fecha de vencimiento CAE (30 días)
    from datetime import datetime, timedelta
    cae_expiration = (datetime.now() + timedelta(days=30)).date()
    
    invoice_data = {
        "sale_id": data.get("sale_id"),
        "cae": data.get("cae", fake_cae),
        "cae_expiration": data.get("cae_expiration", cae_expiration),
        "invoice_type": invoice_type,
        "invoice_number": data.get("invoice_number", next_number)
    }
    
    invoice = service.create_invoice(invoice_data)
    if invoice:
        return jsonify(invoice), 201
    return jsonify({"error": "Failed to create quick invoice"}), 400

@afip_invoices_bp.route("/process-pending", methods=["POST"])
def process_pending_sales():
    """Procesa todas las ventas pendientes creando facturas automáticamente"""
    data = request.get_json()
    invoice_type = data.get("invoice_type", "B") if data else "B"
    
    pending_sales = service.get_pending_sales()
    
    if not pending_sales:
        return jsonify({
            "message": "No pending sales to process",
            "created": [],
            "failed": [],
            "total_created": 0,
            "total_failed": 0
        }), 200
    
    # Crear facturas automáticamente
    invoices_to_create = []
    
    for sale in pending_sales:
        # Generar datos automáticamente
        next_number = service.get_next_invoice_number(invoice_type)
        
        # CAE ficticio
        import uuid
        fake_cae = str(uuid.uuid4()).replace("-", "")[:14].upper()
        
        # Fecha de vencimiento
        from datetime import datetime, timedelta
        cae_expiration = (datetime.now() + timedelta(days=30)).date()
        
        invoices_to_create.append({
            "sale_id": sale["id"],
            "cae": fake_cae,
            "cae_expiration": cae_expiration,
            "invoice_type": invoice_type,
            "invoice_number": next_number
        })
    
    result = service.bulk_create_invoices(invoices_to_create)
    return jsonify(result), 200