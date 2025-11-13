# backend/src/accounting/services/reports_services.py

from src.db import Database
from datetime import datetime, timedelta
from src.db_lock import db_lock  # Importar el candado

class ReportsService:
    def __init__(self):
        self.db = Database()

    def get_daily_report(self, date):
        """Genera reporte completo del día"""
        # 2. Envolver TODA la función en el candado
        with db_lock:
            # Ventas del día
            sales_query = """
            SELECT COUNT(*) as total_sales, COALESCE(SUM(total_amount), 0) as total_amount,
                payment_method, COALESCE(SUM(total_amount), 0) as amount_by_method
            FROM sales 
            WHERE DATE(sale_date) = %s
            GROUP BY payment_method
            """
            sales_results_cursor = self.db.execute(sales_query, (date,))
            results = sales_results_cursor.fetchall()
            sales_by_method = [dict(row) for row in results]
            sales_results_cursor.close()  
            
            # Total general de ventas
            total_sales_query = """
            SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total
            FROM sales WHERE DATE(sale_date) = %s
            """
            cursor = self.db.execute(total_sales_query, (date,))
            total_sales_result = cursor.fetchone()
            cursor.close()  
            
            # Gastos del día
            cash_expenses_query = """
            SELECT COALESCE(SUM(amount), 0) as total
            FROM expenses 
            WHERE expense_date = %s AND (notes LIKE %s OR notes LIKE %s)
            """
            cursor = self.db.execute(cash_expenses_query, (date, '%CAJA%', '%EFECTIVO%'))
            cash_expenses_result = cursor.fetchone()
            cursor.close()  
            
            # Otros gastos
            other_expenses_query = """
            SELECT COALESCE(SUM(amount), 0) as total
            FROM expenses 
            WHERE expense_date = %s AND (notes NOT LIKE %s AND notes NOT LIKE %s)
            """
            cursor = self.db.execute(other_expenses_query, (date, '%CAJA%', '%EFECTIVO%'))
            other_expenses_result = cursor.fetchone()
            cursor.close()  
            
            # Gastos por categoría
            expenses_by_category_query = """
            SELECT category, COALESCE(SUM(amount), 0) as total
            FROM expenses 
            WHERE expense_date = %s
            GROUP BY category
            ORDER BY total DESC
            """
            expenses_cursor = self.db.execute(expenses_by_category_query, (date,))
            results = expenses_cursor.fetchall()
            expenses_by_category = [dict(row) for row in results]
            expenses_cursor.close()  
            
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
            top_products_cursor = self.db.execute(top_products_query, (date,))
            results = top_products_cursor.fetchall()
            top_products = [dict(row) for row in results]
            top_products_cursor.close()  
            
            # Movimientos de stock del día
            stock_movements_query = """
            SELECT sm.movement_type, SUM(sm.quantity) as total_quantity,
                COUNT(*) as total_movements
            FROM stock_movements sm
            WHERE DATE(sm.movement_date) = %s
            GROUP BY sm.movement_type
            """
            stock_cursor = self.db.execute(stock_movements_query, (date,))
            results = stock_cursor.fetchall()
            stock_movements = [dict(row) for row in results]
            stock_cursor.close()  
            
            # Facturas pendientes
            pending_invoices_query = """
            SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total
            FROM sales WHERE invoice_state = 'pendiente'
            """
            cursor = self.db.execute(pending_invoices_query)
            pending_invoices_result = cursor.fetchone()
            cursor.close()  
            
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
        with db_lock:
            # Ventas mensuales por día
            daily_sales_query = """
            SELECT DATE(sale_date) as date, COUNT(*) as sales_count, 
                COALESCE(SUM(total_amount), 0) as total_amount
            FROM sales 
            WHERE YEAR(sale_date) = %s AND MONTH(sale_date) = %s
            GROUP BY DATE(sale_date)
            ORDER BY date
            """
            daily_sales_results_cursor = self.db.execute(daily_sales_query, (year, month))
            results = daily_sales_results_cursor.fetchall()
            daily_sales = [dict(row) for row in results]
            daily_sales_results_cursor.close()  
            
            # Totales mensuales
            monthly_totals_query = """
            SELECT COUNT(*) as total_sales, COALESCE(SUM(total_amount), 0) as total_revenue
            FROM sales 
            WHERE YEAR(sale_date) = %s AND MONTH(sale_date) = %s
            """
            cursor = self.db.execute(monthly_totals_query, (year, month))
            monthly_totals_result = cursor.fetchone()
            cursor.close()  
            
            # Gastos mensuales
            monthly_expenses_query = """
            SELECT category, COALESCE(SUM(amount), 0) as total
            FROM expenses 
            WHERE YEAR(expense_date) = %s AND MONTH(expense_date) = %s
            GROUP BY category
            ORDER BY total DESC
            """
            monthly_expenses_cursor = self.db.execute(monthly_expenses_query, (year, month))
            results = monthly_expenses_cursor.fetchall()
            monthly_expenses = [dict(row) for row in results]
            monthly_expenses_cursor.close()  
            
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
            top_products_monthly_cursor = self.db.execute(top_products_monthly_query, (year, month))
            results = top_products_monthly_cursor.fetchall()
            top_products_monthly = [dict(row) for row in results]
            top_products_monthly_cursor.close()  
            
            # Cierres de caja del mes
            cash_closures_query = """
            SELECT closure_date, total_sales, total_expenses, final_balance
            FROM cash_closures
            WHERE YEAR(closure_date) = %s AND MONTH(closure_date) = %s
            ORDER BY closure_date
            """
            cash_closures_cursor = self.db.execute(cash_closures_query, (year, month))
            results = cash_closures_cursor.fetchall()
            cash_closures = [dict(row) for row in results]
            cash_closures_cursor.close()  
            
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
            cursor.close()  
            
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
        with db_lock:
            # Ventas por mes
            monthly_sales_query = """
            SELECT MONTH(sale_date) as month, COUNT(*) as sales_count, 
                COALESCE(SUM(total_amount), 0) as total_amount
            FROM sales 
            WHERE YEAR(sale_date) = %s
            GROUP BY MONTH(sale_date)
            ORDER BY month
            """
            monthly_sales_cursor = self.db.execute(monthly_sales_query, (year,))
            results = monthly_sales_cursor.fetchall()
            monthly_sales = [dict(row) for row in results]
            monthly_sales_cursor.close()  
            
            # Gastos anuales por categoría
            yearly_expenses_query = """
            SELECT category, COALESCE(SUM(amount), 0) as total
            FROM expenses 
            WHERE YEAR(expense_date) = %s
            GROUP BY category
            ORDER BY total DESC
            """
            yearly_expenses_cursor = self.db.execute(yearly_expenses_query, (year,))
            results = yearly_expenses_cursor.fetchall()
            yearly_expenses = [dict(row) for row in results]
            yearly_expenses_cursor.close()  
            
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
            top_products_yearly_cursor = self.db.execute(top_products_yearly_query, (year,))
            results = top_products_yearly_cursor.fetchall()
            top_products_yearly = [dict(row) for row in results]
            top_products_yearly_cursor.close()  
            
            # Resumen anual
            yearly_summary_query = """
            SELECT COUNT(*) as total_sales, COALESCE(SUM(total_amount), 0) as total_revenue,
                AVG(total_amount) as avg_sale_amount
            FROM sales 
            WHERE YEAR(sale_date) = %s
            """
            cursor = self.db.execute(yearly_summary_query, (year,))
            yearly_summary_result = cursor.fetchone()
            cursor.close()  
            
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
        with db_lock:
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
            cursor.close()  
            
            # Ventas de ayer
            cursor = self.db.execute(today_sales_query, (yesterday,))
            yesterday_sales = cursor.fetchone()
            cursor.close()  
            
            # Ventas del mes actual
            month_sales_query = """
            SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total
            FROM sales WHERE sale_date >= %s
            """
            cursor = self.db.execute(month_sales_query, (this_month_start,))
            month_sales = cursor.fetchone()
            cursor.close()  
            
            # Ventas del mes pasado
            last_month_sales_query = """
            SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total
            FROM sales WHERE sale_date >= %s AND sale_date <= %s
            """
            cursor = self.db.execute(last_month_sales_query, (last_month_start, last_month_end))
            last_month_sales = cursor.fetchone()
            cursor.close()  
            
            # Productos con stock bajo
            low_stock_query = """
            SELECT COUNT(*) as count FROM products WHERE stock <= 10
            """
            cursor = self.db.execute(low_stock_query)
            low_stock_result = cursor.fetchone()
            cursor.close()  
            
            # Facturas pendientes
            pending_invoices_query = """
            SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total
            FROM sales WHERE invoice_state = 'pendiente'
            """
            cursor = self.db.execute(pending_invoices_query)
            pending_invoices = cursor.fetchone()
            cursor.close()  
            
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
            top_products_cursor = self.db.execute(top_products_query, (this_month_start,))
            results = top_products_cursor.fetchall()
            top_products = [dict(row) for row in results]
            top_products_cursor.close()  
            
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
        with db_lock:
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
            results_cursor = self.db.execute(query, (start_date, limit))
            results = results_cursor.fetchall()
            results_cursor.close()  
            
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
        with db_lock:
            # Promedio de venta
            avg_sale_query = """
            SELECT AVG(total_amount) as avg_amount, COUNT(*) as total_sales
            FROM sales
            """
            cursor = self.db.execute(avg_sale_query)
            avg_result = cursor.fetchone()
            cursor.close()  
            
            # Distribución por método de pago
            payment_distribution_query = """
            SELECT payment_method, COUNT(*) as count, SUM(total_amount) as total
            FROM sales
            WHERE payment_method IS NOT NULL
            GROUP BY payment_method
            ORDER BY total DESC
            """
            payment_results_cursor = self.db.execute(payment_distribution_query)
            results = payment_results_cursor.fetchall()
            payment_distribution = [dict(row) for row in results]
            payment_results_cursor.close()  
            
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
            hourly_results_cursor = self.db.execute(hourly_sales_query, (thirty_days_ago,))
            results_hourly = hourly_results_cursor.fetchall()
            hourly_sales = [dict(row) for row in results_hourly]
            hourly_results_cursor.close()  
            
            return {
                "average_sale": {
                    "amount": float(avg_result["avg_amount"]) if avg_result and avg_result["avg_amount"] else 0.0,
                    "total_transactions": avg_result["total_sales"] if avg_result else 0
                },
                "payment_preferences": payment_distribution,
                "hourly_activity": hourly_sales
            }

    def get_weekly_quick_stats(self):
        """Obtiene estadísticas rápidas de la semana actual"""
        with db_lock:
            today = datetime.now().date()
            week_start = today - timedelta(days=today.weekday())
            
            # Ventas de la semana
            week_sales_query = """
            SELECT DATE(sale_date) as date, COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total
            FROM sales 
            WHERE DATE(sale_date) >= %s
            GROUP BY DATE(sale_date)
            ORDER BY date
            """
            cursor_daily = self.db.execute(week_sales_query, (week_start,))
            results = cursor_daily.fetchall()
            daily_sales = [dict(row) for row in results]
            cursor_daily.close()
            
            # Totales de la semana
            week_total_query = """
            SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total
            FROM sales 
            WHERE DATE(sale_date) >= %s
            """
            cursor_total = self.db.execute(week_total_query, (week_start,))
            week_total = cursor_total.fetchone()
            cursor_total.close()
            
            return {
                "week_start": week_start.strftime('%Y-%m-%d'),
                "week_end": today.strftime('%Y-%m-%d'),
                "total_sales": week_total["count"] if week_total else 0,
                "total_amount": float(week_total["total"]) if week_total else 0.0,
                "daily_breakdown": daily_sales
            }

    

    def get_daily_comparison_report(self):
        """Obtiene la comparación de hoy vs ayer"""
        
        today = datetime.now().date()
        yesterday = today - timedelta(days=1)
        
        today_report = self.get_daily_report(today.strftime('%Y-%m-%d'))
        yesterday_report = self.get_daily_report(yesterday.strftime('%Y-%m-%d'))
        
        growth_sales_count = today_report["sales"]["total_count"] - yesterday_report["sales"]["total_count"]
        growth_sales_amount = today_report["sales"]["total_amount"] - yesterday_report["sales"]["total_amount"]
        
        growth_percent = 0
        if yesterday_report["sales"]["total_amount"] > 0:
            growth_percent = (growth_sales_amount / yesterday_report["sales"]["total_amount"]) * 100
        elif today_report["sales"]["total_amount"] > 0:
            growth_percent = 100.0 # Si ayer fue 0 y hoy no, crecimiento "infinito"
            
        return {
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
                "sales_count": growth_sales_count,
                "sales_amount": growth_sales_amount,
                "sales_percent": round(growth_percent, 2)
            }
        }

    def get_monthly_comparison_report(self):
        """Obtiene la comparación de este mes vs el mes pasado"""
        
        now = datetime.now()
        current_month = now.month
        current_year = now.year
        
        prev_month = current_month - 1 if current_month > 1 else 12
        prev_year = current_year if current_month > 1 else current_year - 1
        
        current_report = self.get_monthly_report(current_year, current_month)
        previous_report = self.get_monthly_report(prev_year, prev_month)
        
        return {
            "type": "monthly",
            "current": {
                "period": f"{current_year}-{current_month:02d}",
                "data": current_report["summary"]
            },
            "previous": {
                "period": f"{prev_year}-{prev_month:02d}",
                "data": previous_report["summary"]
            }
        }