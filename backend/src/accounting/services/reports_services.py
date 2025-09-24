# src/accounting/services/reports.py

from src.db import Database
from datetime import datetime, timedelta

class ReportsService:
    def __init__(self):
        self.db = Database()

    def get_daily_report(self, date):
        """Genera reporte completo del día"""
        # Ventas del día
        sales_query = """
        SELECT COUNT(*) as total_sales, COALESCE(SUM(total_amount), 0) as total_amount,
            payment_method, COALESCE(SUM(total_amount), 0) as amount_by_method
        FROM sales 
        WHERE DATE(sale_date) = %s
        GROUP BY payment_method
        """
        sales_results = self.db.execute(sales_query, (date,))
        sales_by_method = [dict(row) for row in sales_results]
        
        # Total general de ventas
        total_sales_query = """
        SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total
        FROM sales WHERE DATE(sale_date) = %s
        """
        cursor = self.db.execute(total_sales_query, (date,))
        total_sales_result = cursor.fetchone()
        
        # Gastos del día (separados por tipo)
        cash_expenses_query = """
        SELECT COALESCE(SUM(amount), 0) as total
        FROM expenses 
        WHERE expense_date = %s AND (notes LIKE %s OR notes LIKE %s)
        """
        cursor = self.db.execute(cash_expenses_query, (date, '%CAJA%', '%EFECTIVO%'))
        cash_expenses_result = cursor.fetchone()
        
        other_expenses_query = """
        SELECT COALESCE(SUM(amount), 0) as total
        FROM expenses 
        WHERE expense_date = %s AND (notes NOT LIKE %s AND notes NOT LIKE %s)
        """
        cursor = self.db.execute(other_expenses_query, (date, '%CAJA%', '%EFECTIVO%'))
        other_expenses_result = cursor.fetchone()
        
        # Gastos por categoría
        expenses_by_category_query = """
        SELECT category, COALESCE(SUM(amount), 0) as total
        FROM expenses 
        WHERE expense_date = %s
        GROUP BY category
        ORDER BY total DESC
        """
        expenses_results = self.db.execute(expenses_by_category_query, (date,))
        expenses_by_category = [dict(row) for row in expenses_results]
        
        # Productos más vendidos
        top_products_query = """
        SELECT p.name, SUM(sp.quantity) as total_sold, 
               SUM(sp.quantity * sp.unit_price) as total_revenue
        FROM sale_product sp
        JOIN products p ON sp.product_id = p.id
        JOIN sales s ON sp.sale_id = s.id
        WHERE DATE(s.sale_date) = %s
        GROUP BY p.id, p.name
        ORDER BY total_sold DESC
        LIMIT 10
        """
        top_products_results = self.db.execute(top_products_query, (date,))
        top_products = [dict(row) for row in top_products_results]
        
        # Movimientos de stock del día
        stock_movements_query = """
        SELECT sm.movement_type, SUM(sm.quantity) as total_quantity,
            COUNT(*) as total_movements
        FROM stock_movements sm
        WHERE DATE(sm.movement_date) = %s
        GROUP BY sm.movement_type
        """
        stock_results = self.db.execute(stock_movements_query, (date,))
        stock_movements = [dict(row) for row in stock_results]
        
        # Facturas pendientes
        pending_invoices_query = """
        SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total
        FROM sales WHERE invoice_state = 'pendiente'
        """
        cursor = self.db.execute(pending_invoices_query)
        pending_invoices_result = cursor.fetchone()
        
        return {
            "date": date,
            "sales": {
                "total_count": total_sales_result["count"] if total_sales_result else 0,
                "total_amount": float(total_sales_result["total"]) if total_sales_result else 0.0,
                "by_payment_method": sales_by_method
            },
            "expenses": {
                "cash_expenses": float(cash_expenses_result["total"]) if cash_expenses_result else 0.0,
                "other_expenses": float(other_expenses_result["total"]) if other_expenses_result else 0.0,
                "by_category": expenses_by_category
            },
            "top_products": top_products,
            "stock_movements": stock_movements,
            "pending_invoices": {
                "count": pending_invoices_result["count"] if pending_invoices_result else 0,
                "total_amount": float(pending_invoices_result["total"]) if pending_invoices_result else 0.0
            },
            "cash_balance": (float(total_sales_result["total"]) if total_sales_result else 0.0) - 
                        (float(cash_expenses_result["total"]) if cash_expenses_result else 0.0)
        }

    def get_monthly_report(self, year, month):
        """Genera reporte mensual completo"""
        # Ventas mensuales por día
        daily_sales_query = """
        SELECT DATE(sale_date) as date, COUNT(*) as sales_count, 
            COALESCE(SUM(total_amount), 0) as total_amount
        FROM sales 
        WHERE YEAR(sale_date) = %s AND MONTH(sale_date) = %s
        GROUP BY DATE(sale_date)
        ORDER BY date
        """
        daily_sales_results = self.db.execute(daily_sales_query, (year, month))
        daily_sales = [dict(row) for row in daily_sales_results]
        
        # Totales mensuales
        monthly_totals_query = """
        SELECT COUNT(*) as total_sales, COALESCE(SUM(total_amount), 0) as total_revenue
        FROM sales 
        WHERE YEAR(sale_date) = %s AND MONTH(sale_date) = %s
        """
        cursor = self.db.execute(monthly_totals_query, (year, month))
        monthly_totals_result = cursor.fetchone()
        
        # Gastos mensuales
        monthly_expenses_query = """
        SELECT category, COALESCE(SUM(amount), 0) as total
        FROM expenses 
        WHERE YEAR(expense_date) = %s AND MONTH(expense_date) = %s
        GROUP BY category
        ORDER BY total DESC
        """
        monthly_expenses_results = self.db.execute(monthly_expenses_query, (year, month))
        monthly_expenses = [dict(row) for row in monthly_expenses_results]
        
        # Productos más vendidos del mes
        top_products_monthly_query = """
        SELECT p.name, SUM(sp.quantity) as total_sold, 
               SUM(sp.quantity * sp.unit_price) as total_revenue
        FROM sale_product sp
        JOIN products p ON sp.product_id = p.id
        JOIN sales s ON sp.sale_id = s.id
        WHERE YEAR(s.sale_date) = %s AND MONTH(s.sale_date) = %s
        GROUP BY p.id, p.name
        ORDER BY total_sold DESC
        LIMIT 20
        """
        top_products_monthly_results = self.db.execute(top_products_monthly_query, (year, month))
        top_products_monthly = [dict(row) for row in top_products_monthly_results]
        
        # Cierres de caja del mes
        cash_closures_query = """
        SELECT closure_date, total_sales, total_expenses, final_balance
        FROM cash_closures
        WHERE YEAR(closure_date) = %s AND MONTH(closure_date) = %s
        ORDER BY closure_date
        """
        cash_closures_results = self.db.execute(cash_closures_query, (year, month))
        cash_closures = [dict(row) for row in cash_closures_results]
        
        # Comparación con mes anterior
        prev_month = month - 1 if month > 1 else 12
        prev_year = year if month > 1 else year - 1
        
        prev_month_query = """
        SELECT COUNT(*) as sales_count, COALESCE(SUM(total_amount), 0) as total_revenue
        FROM sales 
        WHERE YEAR(sale_date) = %s AND MONTH(sale_date) = %s
        """
        cursor = self.db.execute(prev_month_query, (prev_year, prev_month))
        prev_month_result = cursor.fetchone()
        
        current_revenue = float(monthly_totals_result["total_revenue"]) if monthly_totals_result else 0.0
        prev_revenue = float(prev_month_result["total_revenue"]) if prev_month_result else 0.0
        revenue_growth = ((current_revenue - prev_revenue) / prev_revenue * 100) if prev_revenue > 0 else 0
        
        return {
            "period": f"{year}-{month:02d}",
            "summary": {
                "total_sales": monthly_totals_result["total_sales"] if monthly_totals_result else 0,
                "total_revenue": current_revenue,
                "revenue_growth_percent": round(revenue_growth, 2)
            },
            "daily_breakdown": daily_sales,
            "expenses_by_category": monthly_expenses,
            "top_products": top_products_monthly,
            "cash_closures": cash_closures
        }

    def get_yearly_report(self, year):
        """Genera reporte anual completo"""
        # Ventas por mes
        monthly_sales_query = """
        SELECT MONTH(sale_date) as month, COUNT(*) as sales_count, 
            COALESCE(SUM(total_amount), 0) as total_amount
        FROM sales 
        WHERE YEAR(sale_date) = %s
        GROUP BY MONTH(sale_date)
        ORDER BY month
        """
        monthly_sales_results = self.db.execute(monthly_sales_query, (year,))
        monthly_sales = [dict(row) for row in monthly_sales_results]
        
        # Gastos anuales por categoría
        yearly_expenses_query = """
        SELECT category, COALESCE(SUM(amount), 0) as total
        FROM expenses 
        WHERE YEAR(expense_date) = %s
        GROUP BY category
        ORDER BY total DESC
        """
        yearly_expenses_results = self.db.execute(yearly_expenses_query, (year,))
        yearly_expenses = [dict(row) for row in yearly_expenses_results]
        
        # Top productos del año
        top_products_yearly_query = """
        SELECT p.name, SUM(sp.quantity) as total_sold, 
               SUM(sp.quantity * sp.unit_price) as total_revenue
        FROM sale_product sp
        JOIN products p ON sp.product_id = p.id
        JOIN sales s ON sp.sale_id = s.id
        WHERE YEAR(s.sale_date) = %s
        GROUP BY p.id, p.name
        ORDER BY total_revenue DESC
        LIMIT 30
        """
        top_products_yearly_results = self.db.execute(top_products_yearly_query, (year,))
        top_products_yearly = [dict(row) for row in top_products_yearly_results]
        
        # Resumen anual
        yearly_summary_query = """
        SELECT COUNT(*) as total_sales, COALESCE(SUM(total_amount), 0) as total_revenue,
            AVG(total_amount) as avg_sale_amount
        FROM sales 
        WHERE YEAR(sale_date) = %s
        """
        cursor = self.db.execute(yearly_summary_query, (year,))
        yearly_summary_result = cursor.fetchone()
        
        return {
            "year": year,
            "summary": {
                "total_sales": yearly_summary_result["total_sales"] if yearly_summary_result else 0,
                "total_revenue": float(yearly_summary_result["total_revenue"]) if yearly_summary_result else 0.0,
                "avg_sale_amount": float(yearly_summary_result["avg_sale_amount"]) if yearly_summary_result else 0.0
            },
            "monthly_breakdown": monthly_sales,
            "expenses_by_category": yearly_expenses,
            "top_products": top_products_yearly
        }

    def get_dashboard_kpis(self):
        """Obtiene KPIs principales para el dashboard"""
        today = datetime.now().date()
        yesterday = today - timedelta(days=1)
        this_month_start = today.replace(day=1)
        last_month_start = (this_month_start - timedelta(days=1)).replace(day=1)
        last_month_end = this_month_start - timedelta(days=1)
        
        # Ventas de hoy
        today_sales_query = """
        SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total
        FROM sales WHERE DATE(sale_date) = %s
        """
        cursor = self.db.execute(today_sales_query, (today,))
        today_sales = cursor.fetchone()
        
        # Ventas de ayer
        cursor = self.db.execute(today_sales_query, (yesterday,))
        yesterday_sales = cursor.fetchone()
        
        # Ventas del mes actual
        month_sales_query = """
        SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total
        FROM sales WHERE sale_date >= %s
        """
        cursor = self.db.execute(month_sales_query, (this_month_start,))
        month_sales = cursor.fetchone()
        
        # Ventas del mes pasado
        last_month_sales_query = """
        SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total
        FROM sales WHERE sale_date >= %s AND sale_date <= %s
        """
        cursor = self.db.execute(last_month_sales_query, (last_month_start, last_month_end))
        last_month_sales = cursor.fetchone()
        
        # Productos con stock bajo
        low_stock_query = """
        SELECT COUNT(*) as count FROM products WHERE stock <= 10
        """
        cursor = self.db.execute(low_stock_query)
        low_stock_result = cursor.fetchone()
        
        # Facturas pendientes
        pending_invoices_query = """
        SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total
        FROM sales WHERE invoice_state = 'pendiente'
        """
        cursor = self.db.execute(pending_invoices_query)
        pending_invoices = cursor.fetchone()
        
        # Top 5 productos más vendidos del mes
        top_products_query = """
        SELECT p.name, SUM(sp.quantity) as total_sold
        FROM sale_product sp
        JOIN products p ON sp.product_id = p.id
        JOIN sales s ON sp.sale_id = s.id
        WHERE s.sale_date >= %s
        GROUP BY p.id, p.name
        ORDER BY total_sold DESC
        LIMIT 5
        """
        top_products_results = self.db.execute(top_products_query, (this_month_start,))
        top_products = [dict(row) for row in top_products_results]
        
        # Calcular porcentajes de crecimiento
        today_growth = 0
        if yesterday_sales and yesterday_sales["total"] > 0:
            today_amount = float(today_sales["total"]) if today_sales else 0
            yesterday_amount = float(yesterday_sales["total"])
            today_growth = ((today_amount - yesterday_amount) / yesterday_amount) * 100
        
        month_growth = 0
        if last_month_sales and last_month_sales["total"] > 0:
            month_amount = float(month_sales["total"]) if month_sales else 0
            last_month_amount = float(last_month_sales["total"])
            month_growth = ((month_amount - last_month_amount) / last_month_amount) * 100
        
        return {
            "today": {
                "sales_count": today_sales["count"] if today_sales else 0,
                "sales_amount": float(today_sales["total"]) if today_sales else 0.0,
                "growth_percent": round(today_growth, 2)
            },
            "this_month": {
                "sales_count": month_sales["count"] if month_sales else 0,
                "sales_amount": float(month_sales["total"]) if month_sales else 0.0,
                "growth_percent": round(month_growth, 2)
            },
            "alerts": {
                "low_stock_products": low_stock_result["count"] if low_stock_result else 0,
                "pending_invoices": {
                    "count": pending_invoices["count"] if pending_invoices else 0,
                    "amount": float(pending_invoices["total"]) if pending_invoices else 0.0
                }
            },
            "top_products_month": top_products,
            "generated_at": datetime.now().isoformat()
        }

    def get_product_performance(self, limit=50, time_period=30):
        """Obtiene reporte de rendimiento de productos"""
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=time_period)
        
        query = """
        SELECT p.id, p.name, p.price, p.stock,
            COALESCE(SUM(sp.quantity), 0) as total_sold,
            COALESCE(SUM(sp.quantity * sp.unit_price), 0) as total_revenue,
            COALESCE(COUNT(DISTINCT s.id), 0) as times_sold
        FROM products p
        LEFT JOIN sale_product sp ON p.id = sp.product_id
        LEFT JOIN sales s ON sp.sale_id = s.id AND DATE(s.sale_date) >= %s
        GROUP BY p.id, p.name, p.price, p.stock
        ORDER BY total_revenue DESC
        LIMIT %s
        """
        results = self.db.execute(query, (start_date, limit))
        
        products = []
        for row in results:
            product = dict(row)
            product["total_revenue"] = float(product["total_revenue"])
            product["profit_margin"] = float(product["price"]) * int(product["total_sold"]) if product["total_sold"] else 0
            products.append(product)
        
        return {
            "period": f"{start_date} to {end_date}",
            "products": products
        }

    def get_customer_insights(self):
        """Obtiene insights básicos de clientes (basado en ventas)"""
        # Promedio de venta
        avg_sale_query = """
        SELECT AVG(total_amount) as avg_amount, COUNT(*) as total_sales
        FROM sales
        """
        cursor = self.db.execute(avg_sale_query)
        avg_result = cursor.fetchone()
        
        # Distribución por método de pago
        payment_distribution_query = """
        SELECT payment_method, COUNT(*) as count, SUM(total_amount) as total
        FROM sales
        WHERE payment_method IS NOT NULL
        GROUP BY payment_method
        ORDER BY total DESC
        """
        payment_results = self.db.execute(payment_distribution_query)
        payment_distribution = [dict(row) for row in payment_results]
        
        # Ventas por hora del día (últimos 30 días)
        hourly_sales_query = """
        SELECT HOUR(sale_date) as hour, COUNT(*) as sales_count,
            AVG(total_amount) as avg_amount
        FROM sales
        WHERE sale_date >= %s
        GROUP BY HOUR(sale_date)
        ORDER BY hour
        """
        thirty_days_ago = datetime.now() - timedelta(days=30)
        hourly_results = self.db.execute(hourly_sales_query, (thirty_days_ago,))
        hourly_sales = [dict(row) for row in hourly_results]
        
        return {
            "average_sale": {
                "amount": float(avg_result["avg_amount"]) if avg_result and avg_result["avg_amount"] else 0.0,
                "total_transactions": avg_result["total_sales"] if avg_result else 0
            },
            "payment_preferences": payment_distribution,
            "hourly_activity": hourly_sales
        }