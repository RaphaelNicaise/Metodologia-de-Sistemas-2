from flask import Blueprint

# Importar todos los blueprints individuales
from .reports_routes import reports_bp
from .cash_closures_routes import cash_closures_bp
from .expenses_routes import expenses_bp  # Asumiendo que existe
from .afip_invoice_routes import afip_invoices_bp  # Asumiendo que existe

# Crear blueprint principal de contabilidad
accounting_bp = Blueprint('contabilidad', __name__)

# Registrar todos los sub-blueprints
accounting_bp.register_blueprint(reports_bp, url_prefix='/reports')
accounting_bp.register_blueprint(cash_closures_bp, url_prefix='/cash_closures')
accounting_bp.register_blueprint(expenses_bp, url_prefix='/expenses')
accounting_bp.register_blueprint(afip_invoices_bp, url_prefix='/afip_invoices')