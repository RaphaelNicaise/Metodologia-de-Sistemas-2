# src/accounting/services/cash_closures_services.py

from src.accounting.models.cash_closures import CashClosure
from src.db import Database
from datetime import datetime

class CashClosureService:
    def __init__(self):
        self.db = Database()

    def create_daily_closure(self, closure_date, user_id):
        """Crea el cierre de caja diario calculando automáticamente los totales"""
        
        # Validar que no exista ya un cierre para esa fecha
        if self._closure_exists_for_date(closure_date):
            return {"error": "Ya existe un cierre para esta fecha"}, 400
        
        # Validar que el usuario tenga permisos
        if not self._user_can_close_cash(user_id):
            return {"error": "No tienes permisos para cerrar caja"}, 403
        
        try:
            # Calcular totales del día
            daily_data = self._calculate_daily_totals(closure_date)
            
            # Crear el cierre
            closure_data = {
                "closure_date": closure_date,
                "user_id": user_id,
                "total_sales": daily_data["total_sales"],
                "total_expenses": daily_data["cash_expenses"],  # Solo gastos de caja
                "final_balance": daily_data["final_balance"]
            }
            
            query = """
            INSERT INTO cash_closures (closure_date, user_id, total_sales, total_expenses, final_balance)
            VALUES (%s, %s, %s, %s, %s)
            """
            params = (
                closure_data["closure_date"],
                closure_data["user_id"],
                closure_data["total_sales"],
                closure_data["total_expenses"],
                closure_data["final_balance"]
            )
            
            cursor = self.db.execute(query, params)
            closure_id = cursor.lastrowid
            
            # Obtener el cierre creado con información completa
            return self.get_closure_with_details(closure_id), 201
            
        except Exception as e:
            print(f"Error creando cierre de caja: {e}")
            return {"error": "Error interno del servidor"}, 500

    def get_closure_with_details(self, closure_id):
        """Obtiene un cierre con todos los detalles y desgloses"""
        closure = self.get_closure_by_id(closure_id)
        if not closure:
            return None
        
        # Obtener detalles adicionales del día
        daily_data = self._calculate_daily_totals(closure.closure_date)
        
        # Combinar datos del cierre con detalles
        result = closure.to_dict()
        result.update({
            "sales_breakdown": daily_data["sales_breakdown"],
            "expenses_breakdown": daily_data["expenses_breakdown"],
            "cash_expenses": daily_data["cash_expenses"],
            "other_expenses": daily_data["other_expenses"],
            "pending_invoices": daily_data["pending_invoices"],
            "low_stock_products": daily_data["low_stock_products"]
        })
        
        return result

    def get_all_closures(self, limit=50, offset=0):
        """Obtiene todos los cierres con información del usuario"""
        query = """
        SELECT cc.*, u.name as user_name
        FROM cash_closures cc
        LEFT JOIN users u ON cc.user_id = u.id
        ORDER BY cc.closure_date DESC
        LIMIT %s OFFSET %s
        """
        results = self.db.execute(query, (limit, offset))
        closures = []
        for row in results:
            closure = CashClosure(**{k: v for k, v in row.items() if k != 'user_name'})
            closure_dict = closure.to_dict()
            closure_dict['user_name'] = row.get('user_name')
            closures.append(closure_dict)
        return closures

    def get_closure_by_id(self, closure_id):
        """Obtiene un cierre específico por ID"""
        query = "SELECT * FROM cash_closures WHERE id = %s"
        cursor = self.db.execute(query, (closure_id,))
        row = cursor.fetchone()
        return CashClosure(**row) if row else None

    def get_closure_by_date(self, closure_date):
        """Obtiene un cierre específico por fecha"""
        query = "SELECT * FROM cash_closures WHERE closure_date = %s"
        cursor = self.db.execute(query, (closure_date,))
        row = cursor.fetchone()
        return CashClosure(**row) if row else None

    def get_closures_by_date_range(self, start_date, end_date):
        """Obtiene cierres en un rango de fechas"""
        query = """
        SELECT cc.*, u.name as user_name
        FROM cash_closures cc
        LEFT JOIN users u ON cc.user_id = u.id
        WHERE cc.closure_date BETWEEN %s AND %s
        ORDER BY cc.closure_date DESC
        """
        results = self.db.execute(query, (start_date, end_date))
        closures = []
        for row in results:
            closure = CashClosure(**{k: v for k, v in row.items() if k != 'user_name'})
            closure_dict = closure.to_dict()
            closure_dict['user_name'] = row.get('user_name')
            closures.append(closure_dict)
        return closures

    def get_monthly_summary(self, year, month):
        """Obtiene resumen mensual de cierres"""
        query = """
        SELECT 
            COUNT(*) as total_closures,
            SUM(total_sales) as monthly_sales,
            SUM(total_expenses) as monthly_expenses,
            SUM(final_balance) as monthly_balance,
            AVG(final_balance) as avg_daily_balance
        FROM cash_closures
        WHERE YEAR(closure_date) = %s AND MONTH(closure_date) = %s
        """
        cursor = self.db.execute(query, (year, month))
        result = cursor.fetchone()
        return dict(result) if result else {}

    def _closure_exists_for_date(self, closure_date):
        """Verifica si ya existe un cierre para la fecha"""
        query = "SELECT COUNT(*) as count FROM cash_closures WHERE closure_date = %s"
        cursor = self.db.execute(query, (closure_date,))
        result = cursor.fetchone()
        return result["count"] > 0 if result else False

    def _user_can_close_cash(self, user_id):
        """Verifica si el usuario tiene permisos para cerrar caja"""
        query = "SELECT role FROM users WHERE id = %s"
        cursor = self.db.execute(query, (user_id,))
        result = cursor.fetchone()
        
        if not result:
            return False
        
        # Solo admin y empleado pueden cerrar caja
        return result["role"] in ["admin", "empleado"]

    def _calculate_daily_totals(self, closure_date):
        """Calcula todos los totales y desgloses del día"""
        
        # 1. Total de ventas del día
        query = "SELECT COALESCE(SUM(total_amount), 0) as total FROM sales WHERE DATE(sale_date) = %s"
        cursor = self.db.execute(query, (closure_date,))
        result = cursor.fetchone()
        total_sales = float(result["total"]) if result else 0.0
        
        # 2. Desglose de ventas por método de pago
        query = """
        SELECT payment_method, COALESCE(SUM(total_amount), 0) as total
        FROM sales 
        WHERE DATE(sale_date) = %s
        GROUP BY payment_method
        """
        results = self.db.execute(query, (closure_date,))
        sales_breakdown = {row["payment_method"]: float(row["total"]) for row in results}
        
        # 3. Gastos que afectan la caja (con "CAJA" o "EFECTIVO" en notes)
        query = """
        SELECT COALESCE(SUM(amount), 0) as total
        FROM expenses 
        WHERE expense_date = %s
        AND (notes LIKE %s OR notes LIKE %s)
        """
        cursor = self.db.execute(query, (closure_date, '%CAJA%', '%EFECTIVO%'))
        result = cursor.fetchone()
        cash_expenses = float(result["total"]) if result else 0.0
        
        # 4. Otros gastos (no afectan caja)
        query = """
        SELECT COALESCE(SUM(amount), 0) as total
        FROM expenses 
        WHERE expense_date = %s
        AND (notes NOT LIKE %s AND notes NOT LIKE %s)
        """
        cursor = self.db.execute(query, (closure_date, '%CAJA%', '%EFECTIVO%'))
        result = cursor.fetchone()
        other_expenses = float(result["total"]) if result else 0.0
        
        # 5. Desglose de gastos por categoría
        query = """
        SELECT category, COALESCE(SUM(amount), 0) as total
        FROM expenses 
        WHERE expense_date = %s
        GROUP BY category
        """
        results = self.db.execute(query, (closure_date,))
        expenses_breakdown = {row["category"]: float(row["total"]) for row in results}
        
        # 6. Facturas pendientes
        query = "SELECT COUNT(*) as count FROM sales WHERE invoice_state = 'pendiente'"
        cursor = self.db.execute(query)
        result = cursor.fetchone()
        pending_invoices = result["count"] if result else 0
        
        # 7. Productos con stock bajo
        query = "SELECT COUNT(*) as count FROM products WHERE stock <= 10"
        cursor = self.db.execute(query)
        result = cursor.fetchone()
        low_stock_products = result["count"] if result else 0
        
        # Calcular balance final (ventas - solo gastos de caja)
        final_balance = total_sales - cash_expenses
        
        return {
            "total_sales": total_sales,
            "sales_breakdown": sales_breakdown,
            "cash_expenses": cash_expenses,
            "other_expenses": other_expenses,
            "expenses_breakdown": expenses_breakdown,
            "final_balance": final_balance,
            "pending_invoices": pending_invoices,
            "low_stock_products": low_stock_products
        }

    def can_close_day(self, closure_date):
        """Verifica si se puede cerrar el día (no existe cierre)"""
        return not self._closure_exists_for_date(closure_date)

    def get_daily_preview(self, closure_date):
        """Obtiene una preview del cierre sin crearlo"""
        if self._closure_exists_for_date(closure_date):
            return {"error": "Ya existe un cierre para esta fecha"}, 400
        
        daily_data = self._calculate_daily_totals(closure_date)
        daily_data["can_close"] = True
        daily_data["closure_date"] = closure_date
        
        return daily_data, 200