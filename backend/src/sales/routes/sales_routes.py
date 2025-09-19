from flask import Blueprint, jsonify, request
from sales.services.sale_service import SaleService
from datetime import datetime


sales_bp = Blueprint("sales", __name__, url_prefix='/api/sales')
sale_service = SaleService()

@sales_bp.route('/start', methods=['POST'])
def start_new_sale():
    """Iniciar una nueva venta vacía - PASO 1"""
    try:
        data = request.json or {}
        payment_method = data.get('payment_method', 'efectivo')
        ticket_url = data.get('ticket_url', '')
        
        new_sale = sale_service.start_new_sale(payment_method, ticket_url)
        
        return jsonify({
            'success': True,
            'message': 'Venta iniciada correctamente',
            'sale': new_sale.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al iniciar venta: {str(e)}'
        }), 500

@sales_bp.route('/<int:sale_id>/add-product', methods=['POST'])
def add_product_to_sale(sale_id):
    """Agregar producto a venta actual - PASO 2"""
    try:
        data = request.json
        
        # Validar datos requeridos
        required_fields = ['product_id', 'quantity', 'unit_price']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'message': f'Campo requerido: {field}'
                }), 400
        
        # Agregar producto
        result = sale_service.add_product_to_current_sale(
            sale_id=sale_id,
            product_id=data['product_id'],
            quantity=data['quantity'],
            unit_price=data['unit_price']
        )
        
        if result:
            # Obtener detalles actualizados de la venta
            sale_details = sale_service.get_current_sale_details(sale_id)
            
            return jsonify({
                'success': True,
                'message': 'Producto agregado correctamente',
                'sale_details': sale_details
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Error al agregar producto'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@sales_bp.route('/<int:sale_id>/remove-product', methods=['DELETE'])
def remove_product_from_sale(sale_id):
    """Remover producto de venta actual"""
    try:
        data = request.json
        product_id = data.get('product_id')
        quantity = data.get('quantity')  # Opcional: si no se especifica, remueve todo
        
        if not product_id:
            return jsonify({
                'success': False,
                'message': 'product_id es requerido'
            }), 400
        
        result = sale_service.remove_product_from_current_sale(sale_id, product_id, quantity)
        
        if result:
            sale_details = sale_service.get_current_sale_details(sale_id)
            return jsonify({
                'success': True,
                'message': 'Producto removido correctamente',
                'sale_details': sale_details
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Error al remover producto'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@sales_bp.route('/<int:sale_id>/finalize', methods=['POST'])
def finalize_sale(sale_id):
    """Finalizar venta - PASO 3"""
    try:
        data = request.json or {}
        payment_method = data.get('payment_method')
        ticket_url = data.get('ticket_url')
        
        completed_sale = sale_service.finalize_sale(sale_id, payment_method, ticket_url)
        
        return jsonify({
            'success': True,
            'message': 'Venta finalizada correctamente',
            'sale': completed_sale.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al finalizar venta: {str(e)}'
        }), 500

@sales_bp.route('/<int:sale_id>/cancel', methods=['DELETE'])
def cancel_sale(sale_id):
    """Cancelar una venta"""
    try:
        result = sale_service.cancel_sale(sale_id)
        
        if result:
            return jsonify({
                'success': True,
                'message': 'Venta cancelada correctamente'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'No se pudo cancelar la venta (puede que no exista o ya esté finalizada)'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al cancelar venta: {str(e)}'
        }), 500

# ========== ENDPOINTS DE CONSULTA ==========

@sales_bp.route('/<int:sale_id>', methods=['GET'])
def get_sale_details(sale_id):
    """Obtener detalles completos de una venta"""
    try:
        sale_details = sale_service.get_current_sale_details(sale_id)
        
        if sale_details:
            return jsonify({
                'success': True,
                'sale_details': sale_details
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

@sales_bp.route('/', methods=['GET'])
def get_all_sales():
    """Obtener todas las ventas"""
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

@sales_bp.route('/by-date/<date>', methods=['GET'])
def get_sales_by_date(date):
    """Obtener ventas por fecha específica (formato: YYYY-MM-DD)"""
    try:
        # Validar formato de fecha
        try:
            datetime.strptime(date, '%Y-%m-%d')
        except ValueError:
            return jsonify({
                'success': False,
                'message': 'Formato de fecha inválido. Use YYYY-MM-DD'
            }), 400
        
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

@sales_bp.route('/summary', methods=['GET'])
def get_daily_summary():
    """Obtener resumen de ventas del día actual"""
    try:
        date = request.args.get('date')  # Parámetro opcional
        
        if date:
            # Validar formato si se proporciona fecha
            try:
                date = datetime.strptime(date, '%Y-%m-%d').date()
            except ValueError:
                return jsonify({
                    'success': False,
                    'message': 'Formato de fecha inválido. Use YYYY-MM-DD'
                }), 400
        
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

# ========== ENDPOINTS ADICIONALES ==========

@sales_bp.route('/<int:sale_id>/products', methods=['GET'])
def get_sale_products(sale_id):
    """Obtener solo los productos de una venta"""
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

@sales_bp.route('/today', methods=['GET'])
def get_today_sales():
    """Obtener ventas de hoy (acceso rápido)"""
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