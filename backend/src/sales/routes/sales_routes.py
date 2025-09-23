from flask import Blueprint, request, jsonify
from sales.services.sale_service import SaleService
from datetime import datetime

sales_bp = Blueprint('sales', __name__, url_prefix='/api/sales')
sale_service = SaleService()

# ------------ ENDPOINT PRINCIPAL  ------------

@sales_bp.route('/', methods=['POST'])
def create_sale():
    """Crear venta completa con productos - Endpoint principal"""
    try:
        data = request.json or {}
        
        sale_data = {
            'sale_date': data.get('sale_date'),
            'payment_method': data.get('payment_method', 'efectivo'),
            'ticket_url': data.get('ticket_url', ''),
            'invoice_state': data.get('invoice_state', 'pendiente')
        }
        
        new_sale = sale_service.create_sale(sale_data, data.get('products', []))
        
        return jsonify({
            'success': True,
            'message': 'Venta creada correctamente',
            'sale': new_sale.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al crear venta: {str(e)}'
        }), 500
    
# ------------ ENDPOINTS DE CONSULTA ------------

@sales_bp.route('/', methods=['GET'])
def get_all_sales():
    try:
        sales = sale_service.get_all_sales()
        
        return jsonify({
            'success': True,
            'sales': [sale.to_dict() for sale in sales],
            'total': len(sales)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@sales_bp.route('/<int:sale_id>', methods=['GET'])
def get_sale(sale_id):
    try:
        sale = sale_service.get_sale_by_id(sale_id)
        
        if sale:
            return jsonify({
                'success': True,
                'sale': sale.to_dict()
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Venta no encontrada'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@sales_bp.route('/<int:sale_id>/complete', methods=['GET'])
def get_sale_complete(sale_id):
    try:
        sale_complete = sale_service.get_sale_with_products(sale_id)
        
        if sale_complete:
            return jsonify({
                'success': True,
                'data': sale_complete
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Venta no encontrada'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@sales_bp.route('/<int:sale_id>/products', methods=['GET'])
def get_sale_products(sale_id):
    try:
        products = sale_service.get_products_by_sale_id(sale_id)
        
        return jsonify({
            'success': True,
            'sale_id': sale_id,
            'products': [product.to_dict() for product in products],
            'total_items': sum(p.quantity for p in products)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@sales_bp.route('/by-date/<date>', methods=['GET'])
def get_sales_by_date(date):
    """Obtener ventas por fecha (YYYY-MM-DD)"""
    try:
        sales = sale_service.get_sales_by_date(date)
        
        return jsonify({
            'success': True,
            'date': date,
            'sales': [sale.to_dict() for sale in sales],
            'total': len(sales)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@sales_bp.route('/today', methods=['GET'])
def get_today_sales():
    try:
        today = datetime.now().strftime('%Y-%m-%d')
        sales = sale_service.get_sales_by_date(today)
        summary = sale_service.get_daily_summary()
        
        return jsonify({
            'success': True,
            'date': today,
            'sales': [sale.to_dict() for sale in sales],
            'summary': summary
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@sales_bp.route('/summary', methods=['GET'])
def get_sales_summary():
    """Obtener resumen de ventas"""
    try:
        date_str = request.args.get('date')  # Parámetro opcional
        date = None
        
        if date_str:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
        
        summary = sale_service.get_daily_summary(date)
        
        return jsonify({
            'success': True,
            'summary': summary
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

#------------ ENDPOINTS ADICIONALES ------------

@sales_bp.route('/<int:sale_id>/status', methods=['PUT'])
def update_sale_status(sale_id):
    """Actualizar estado de facturación o URL del ticket"""
    try:
        data = request.json or {}
        invoice_state = data.get('invoice_state')
        ticket_url = data.get('ticket_url')
        
        updated_sale = sale_service.update_sale_status(sale_id, invoice_state, ticket_url)
        
        if updated_sale:
            return jsonify({
                'success': True,
                'message': 'Venta actualizada correctamente',
                'sale': updated_sale.to_dict()
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Venta no encontrada'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@sales_bp.route('/<int:sale_id>', methods=['DELETE'])
def delete_sale(sale_id):
    """Eliminar venta y restaurar stock"""
    try:
        result = sale_service.delete_sale(sale_id)
        
        if result:
            return jsonify({
                'success': True,
                'message': 'Venta eliminada correctamente'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Venta no encontrada'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al eliminar venta: {str(e)}'
        }), 500

# ========== MANEJO DE ERRORES ==========

@sales_bp.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'message': 'Endpoint no encontrado'
    }), 404

@sales_bp.errorhandler(405)
def method_not_allowed(error):
    return jsonify({
        'success': False,
        'message': 'Método no permitido'
    }), 405

@sales_bp.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'message': 'Error interno del servidor'
    }), 500