# backend/src/accounting/routes/reports_routes.py

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
    report = service.get_weekly_quick_stats()
    return jsonify(report), 200


@reports_bp.route("/comparison", methods=["GET"])
def get_comparison_report():
    """Compara períodos (hoy vs ayer, este mes vs mes pasado, etc.)"""
    comparison_type = request.args.get("type", "daily")

    if comparison_type == "daily":
        report = service.get_daily_comparison_report()
        return jsonify(report), 200
    
    elif comparison_type == "monthly":
        report = service.get_monthly_comparison_report()
        return jsonify(report), 200
    
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
    
    if kpis["alerts"]["low_stock_products"] > 0:
        alerts.append({
            "type": "warning",
            "category": "inventory",
            "message": f"{kpis['alerts']['low_stock_products']} productos con stock bajo",
            "action": "Revisar inventario y realizar pedidos"
        })
    
    if kpis["alerts"]["pending_invoices"]["count"] > 10:
        alerts.append({
            "type": "info",
            "category": "invoicing",
            "message": f"{kpis['alerts']['pending_invoices']['count']} facturas pendientes",
            "action": "Procesar facturación AFIP"
        })
    
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