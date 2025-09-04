# src/accounting/routes/cash_closures_routes.py

from flask import Blueprint, jsonify, request
from accounting.services.cash_closures_services import CashClosureService
from datetime import datetime

cash_closures_bp = Blueprint("cash_closures", __name__)
service = CashClosureService()

@cash_closures_bp.route("/", methods=["GET"])
def get_cash_closures():
    """Obtiene todos los cierres de caja con paginación"""
    limit = int(request.args.get("limit", 50))
    offset = int(request.args.get("offset", 0))
    closures = service.get_all_closures(limit, offset)
    return jsonify(closures), 200

@cash_closures_bp.route("/<int:closure_id>", methods=["GET"])
def get_cash_closure(closure_id):
    """Obtiene un cierre específico con todos los detalles"""
    closure = service.get_closure_with_details(closure_id)
    if closure:
        return jsonify(closure), 200
    return jsonify({"error": "Cash closure not found"}), 404

@cash_closures_bp.route("/close_day", methods=["POST"])
def close_day():
    """Crea el cierre de caja del día"""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    closure_date = data.get("closure_date")
    user_id = data.get("user_id")
    
    # Validaciones básicas
    if not closure_date or not user_id:
        return jsonify({"error": "closure_date and user_id are required"}), 400
    
    # Validar formato de fecha
    try:
        datetime.strptime(closure_date, '%Y-%m-%d')
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
    
    result, status_code = service.create_daily_closure(closure_date, user_id)
    return jsonify(result), status_code

@cash_closures_bp.route("/date/<string:closure_date>", methods=["GET"])
def get_closure_by_date(closure_date):
    """Obtiene el cierre de una fecha específica"""
    try:
        datetime.strptime(closure_date, '%Y-%m-%d')
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
    
    closure = service.get_closure_by_date(closure_date)
    if closure:
        # Obtener detalles completos
        closure_details = service.get_closure_with_details(closure.id)
        return jsonify(closure_details), 200
    
    return jsonify({"error": "No closure found for this date"}), 404

@cash_closures_bp.route("/date-range", methods=["GET"])
def get_closures_by_date_range():
    """Obtiene cierres en un rango de fechas"""
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    
    if not start_date or not end_date:
        return jsonify({"error": "start_date and end_date are required"}), 400
    
    try:
        datetime.strptime(start_date, '%Y-%m-%d')
        datetime.strptime(end_date, '%Y-%m-%d')
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
    
    closures = service.get_closures_by_date_range(start_date, end_date)
    return jsonify(closures), 200

@cash_closures_bp.route("/preview/<string:closure_date>", methods=["GET"])
def preview_daily_closure(closure_date):
    """Obtiene una preview del cierre sin crearlo"""
    try:
        datetime.strptime(closure_date, '%Y-%m-%d')
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
    
    result, status_code = service.get_daily_preview(closure_date)
    return jsonify(result), status_code

@cash_closures_bp.route("/can-close/<string:closure_date>", methods=["GET"])
def can_close_day(closure_date):
    """Verifica si se puede cerrar un día específico"""
    try:
        datetime.strptime(closure_date, '%Y-%m-%d')
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
    
    can_close = service.can_close_day(closure_date)
    return jsonify({"can_close": can_close, "date": closure_date}), 200

@cash_closures_bp.route("/monthly-summary", methods=["GET"])
def get_monthly_summary():
    """Obtiene resumen mensual de cierres"""
    year = request.args.get("year", datetime.now().year)
    month = request.args.get("month", datetime.now().month)
    
    try:
        year = int(year)
        month = int(month)
        if month < 1 or month > 12:
            raise ValueError
    except ValueError:
        return jsonify({"error": "Invalid year or month"}), 400
    
    summary = service.get_monthly_summary(year, month)
    return jsonify(summary), 200

# Endpoints adicionales para estadísticas y reportes

@cash_closures_bp.route("/stats/recent", methods=["GET"])
def get_recent_closures_stats():
    """Obtiene estadísticas de cierres recientes (últimos 7 días)"""
    from datetime import datetime, timedelta
    
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=7)
    
    closures = service.get_closures_by_date_range(start_date, end_date)
    
    if not closures:
        return jsonify({
            "period": f"{start_date} to {end_date}",
            "total_closures": 0,
            "total_sales": 0,
            "total_expenses": 0,
            "total_balance": 0,
            "avg_daily_balance": 0,
            "closures": []
        }), 200
    
    # Calcular estadísticas
    total_sales = sum(c['total_sales'] for c in closures)
    total_expenses = sum(c['total_expenses'] for c in closures)
    total_balance = sum(c['final_balance'] for c in closures)
    avg_daily_balance = total_balance / len(closures)
    
    stats = {
        "period": f"{start_date} to {end_date}",
        "total_closures": len(closures),
        "total_sales": total_sales,
        "total_expenses": total_expenses,
        "total_balance": total_balance,
        "avg_daily_balance": round(avg_daily_balance, 2),
        "closures": closures
    }
    
    return jsonify(stats), 200

@cash_closures_bp.route("/today-preview", methods=["GET"])
def get_today_preview():
    """Obtiene preview del cierre de hoy"""
    today = datetime.now().date().strftime('%Y-%m-%d')
    result, status_code = service.get_daily_preview(today)
    return jsonify(result), status_code

@cash_closures_bp.route("/close-today", methods=["POST"])
def close_today():
    """Cierra el día de hoy"""
    data = request.get_json()
    
    if not data or not data.get("user_id"):
        return jsonify({"error": "user_id is required"}), 400
    
    today = datetime.now().date().strftime('%Y-%m-%d')
    user_id = data.get("user_id")
    
    result, status_code = service.create_daily_closure(today, user_id)
    return jsonify(result), status_code