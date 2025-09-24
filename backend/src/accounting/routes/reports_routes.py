# src/accounting/routes/reports.py

from flask import Blueprint, jsonify, request
from src.accounting.services.reports_services import ReportsService
from datetime import datetime, timedelta

reports_bp = Blueprint("reports", __name__)
service = ReportsService()

@reports_bp.route("/daily", methods=["GET"])
def get_daily_report():
    """Obtiene reporte diario completo"""
    date = request.args.get("date", datetime.now().date().strftime('%Y-%m-%d'))
    
    try:
        datetime.strptime(date, '%Y-%m-%d')
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
    
    report = service.get_daily_report(date)
    return jsonify(report), 200

@reports_bp.route("/monthly", methods=["GET"])
def get_monthly_report():
    """Obtiene reporte mensual completo"""
    year = request.args.get("year", datetime.now().year)
    month = request.args.get("month", datetime.now().month)
    
    try:
        year = int(year)
        month = int(month)
        if month < 1 or month > 12:
            raise ValueError
    except ValueError:
        return jsonify({"error": "Invalid year or month"}), 400
    
    report = service.get_monthly_report(year, month)
    return jsonify(report), 200

@reports_bp.route("/yearly", methods=["GET"])
def get_yearly_report():
    """Obtiene reporte anual completo"""
    year = request.args.get("year", datetime.now().year)
    
    try:
        year = int(year)
    except ValueError:
        return jsonify({"error": "Invalid year"}), 400
    
    report = service.get_yearly_report(year)
    return jsonify(report), 200

@reports_bp.route("/dashboard", methods=["GET"])
def get_dashboard_kpis():
    """Obtiene KPIs principales para el dashboard"""
    kpis = service.get_dashboard_kpis()
    return jsonify(kpis), 200

@reports_bp.route("/products/performance", methods=["GET"])
def get_product_performance():
    """Obtiene reporte de rendimiento de productos"""
    limit = int(request.args.get("limit", 50))
    time_period = int(request.args.get("days", 30))
    
    if limit > 200:  # Límite máximo
        limit = 200
    
    if time_period > 365:  # Máximo un año
        time_period = 365
    
    report = service.get_product_performance(limit, time_period)
    return jsonify(report), 200

@reports_bp.route("/customers/insights", methods=["GET"])
def get_customer_insights():
    """Obtiene insights básicos de clientes"""
    insights = service.get_customer_insights()
    return jsonify(insights), 200

# Endpoints específicos para métricas rápidas

@reports_bp.route("/quick-stats/today", methods=["GET"])
def get_today_quick_stats():
    """Obtiene estadísticas rápidas del día"""
    today = datetime.now().date().strftime('%Y-%m-%d')
    report = service.get_daily_report(today)
    
    # Extraer solo las métricas más importantes
    quick_stats = {
        "date": today,
        "sales_count": report["sales"]["total_count"],
        "sales_amount": report["sales"]["total_amount"],
        "cash_balance": report["cash_balance"],
        "top_products": report["top_products"][:5],  # Solo top 5
        "pending_invoices": report["pending_invoices"]["count"]
    }
    
    return jsonify(quick_stats), 200

@reports_bp.route("/quick-stats/week", methods=["GET"])
def get_week_quick_stats():
    """Obtiene estadísticas rápidas de la semana"""
    
    
    today = datetime.now().date()
    week_start = today - timedelta(days=today.weekday())  # Lunes de esta semana
    
    # Ventas de la semana
    week_sales_query = """
    SELECT DATE(sale_date) as date, COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total
    FROM sales 
    WHERE DATE(sale_date) >= %s
    GROUP BY DATE(sale_date)
    ORDER BY date
    """
    
    db = service.db
    results = db.execute(week_sales_query, (week_start,))
    daily_sales = [dict(row) for row in results]
    
    # Totales de la semana
    week_total_query = """
    SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total
    FROM sales 
    WHERE DATE(sale_date) >= %s
    """
    cursor = db.execute(week_total_query, (week_start,))
    week_total = cursor.fetchone()
    
    return jsonify({
        "week_start": week_start.strftime('%Y-%m-%d'),
        "week_end": today.strftime('%Y-%m-%d'),
        "total_sales": week_total["count"] if week_total else 0,
        "total_amount": float(week_total["total"]) if week_total else 0.0,
        "daily_breakdown": daily_sales
    }), 200

@reports_bp.route("/comparison", methods=["GET"])
def get_comparison_report():
    """Compara períodos (hoy vs ayer, este mes vs mes pasado, etc.)"""
    comparison_type = request.args.get("type", "daily")  # daily, monthly, yearly
    
    if comparison_type == "daily":
        today = datetime.now().date()
        yesterday = today - timedelta(days=1)
        
        today_report = service.get_daily_report(today.strftime('%Y-%m-%d'))
        yesterday_report = service.get_daily_report(yesterday.strftime('%Y-%m-%d'))
        
        return jsonify({
            "type": "daily",
            "current": {
                "date": today.strftime('%Y-%m-%d'),
                "sales_count": today_report["sales"]["total_count"],
                "sales_amount": today_report["sales"]["total_amount"],
                "cash_balance": today_report["cash_balance"]
            },
            "previous": {
                "date": yesterday.strftime('%Y-%m-%d'),
                "sales_count": yesterday_report["sales"]["total_count"],
                "sales_amount": yesterday_report["sales"]["total_amount"],
                "cash_balance": yesterday_report["cash_balance"]
            },
            "growth": {
                "sales_count": today_report["sales"]["total_count"] - yesterday_report["sales"]["total_count"],
                "sales_amount": today_report["sales"]["total_amount"] - yesterday_report["sales"]["total_amount"],
                "sales_percent": ((today_report["sales"]["total_amount"] - yesterday_report["sales"]["total_amount"]) / yesterday_report["sales"]["total_amount"] * 100) if yesterday_report["sales"]["total_amount"] > 0 else 0
            }
        }), 200
    
    elif comparison_type == "monthly":
        now = datetime.now()
        current_month = now.month
        current_year = now.year
        
        prev_month = current_month - 1 if current_month > 1 else 12
        prev_year = current_year if current_month > 1 else current_year - 1
        
        current_report = service.get_monthly_report(current_year, current_month)
        previous_report = service.get_monthly_report(prev_year, prev_month)
        
        return jsonify({
            "type": "monthly",
            "current": {
                "period": f"{current_year}-{current_month:02d}",
                "data": current_report["summary"]
            },
            "previous": {
                "period": f"{prev_year}-{prev_month:02d}",
                "data": previous_report["summary"]
            }
        }), 200
    
    else:
        return jsonify({"error": "Invalid comparison type. Use 'daily' or 'monthly'"}), 400

# Endpoints para exportación (preparación futura)

@reports_bp.route("/export/daily/<string:date>", methods=["GET"])
def export_daily_report(date):
    """Prepara datos para exportación del reporte diario"""
    try:
        datetime.strptime(date, '%Y-%m-%d')
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
    
    report = service.get_daily_report(date)
    
    # Formato optimizado para exportación
    export_data = {
        "report_type": "daily",
        "date": date,
        "summary": {
            "total_sales": report["sales"]["total_count"],
            "total_revenue": report["sales"]["total_amount"],
            "cash_expenses": report["expenses"]["cash_expenses"],
            "net_balance": report["cash_balance"]
        },
        "details": report,
        "generated_at": datetime.now().isoformat(),
        "export_ready": True
    }
    
    return jsonify(export_data), 200

@reports_bp.route("/alerts", methods=["GET"])
def get_business_alerts():
    """Obtiene alertas importantes del negocio"""
    kpis = service.get_dashboard_kpis()
    
    alerts = []
    
    # Alerta de stock bajo
    if kpis["alerts"]["low_stock_products"] > 0:
        alerts.append({
            "type": "warning",
            "category": "inventory",
            "message": f"{kpis['alerts']['low_stock_products']} productos con stock bajo",
            "action": "Revisar inventario y realizar pedidos"
        })
    
    # Alerta de facturas pendientes
    if kpis["alerts"]["pending_invoices"]["count"] > 10:
        alerts.append({
            "type": "info",
            "category": "invoicing",
            "message": f"{kpis['alerts']['pending_invoices']['count']} facturas pendientes",
            "action": "Procesar facturación AFIP"
        })
    
    # Alerta de crecimiento negativo
    if kpis["today"]["growth_percent"] < -10:
        alerts.append({
            "type": "warning",
            "category": "sales",
            "message": f"Ventas de hoy {kpis['today']['growth_percent']:.1f}% menores que ayer",
            "action": "Revisar estrategia de ventas"
        })
    
    return jsonify({
        "alerts": alerts,
        "total_alerts": len(alerts),
        "last_check": datetime.now().isoformat()
    }), 200