from sales.models.sale_model import Sale
from sales.models.sale_product import SaleProduct
import mysql.connector 
from db import Database
from decimal import Decimal
from datetime import datetime

class SaleService:
    def __init__(self):
        self.db = Database()

    # ========== FLUJO PRINCIPAL DE VENTA ==========
    
    def start_new_sale(self, payment_method="efectivo", ticket_url=""):
        """Iniciar una nueva venta vacía PASO 1"""
        query = """
        INSERT INTO sales (sale_date, total_amount, payment_method, ticket_url, invoice_state)
        VALUES (%s, %s, %s, %s, %s)
        """
        params = (
            datetime.now(),     # Fecha actual
            0.00,              # Total inicial = 0
            payment_method,    # Método de pago
            ticket_url,        # URL del ticket (vacía inicialmente)
            'pendiente'        # Estado inicial
        )
        
        try:
            cursor = self.db.execute(query, params)
            sale_id = cursor.lastrowid
            
            # Retornar la venta vacía creada
            return self.get_sale_by_id(sale_id)
            
        except Exception as e:
            print(f"Error al iniciar nueva venta: {e}")
            raise e
    
    def add_product_to_current_sale(self, sale_id, product_id, quantity, unit_price):
        """Agregar un producto a la venta actual PASO 2"""
        connection = self.db.get_connection()
        cursor = connection.cursor()
        
        try:
            connection.start_transaction()
            
            # 1. Verificar si el producto ya está en la venta
            check_query = """
            SELECT quantity FROM sale_product 
            WHERE sale_id = %s AND product_id = %s
            """
            cursor.execute(check_query, (sale_id, product_id))
            existing = cursor.fetchone()
            
            if existing:
                # Si ya existe, sumar la cantidad
                new_quantity = existing[0] + quantity
                update_query = """
                UPDATE sale_product 
                SET quantity = %s 
                WHERE sale_id = %s AND product_id = %s
                """
                cursor.execute(update_query, (new_quantity, sale_id, product_id))
            else:
                # Si no existe, crear nuevo registro
                insert_query = """
                INSERT INTO sale_product (sale_id, product_id, quantity, unit_price)
                VALUES (%s, %s, %s, %s)
                """
                cursor.execute(insert_query, (sale_id, product_id, quantity, unit_price))
            
            # 2. Verificar que hay stock suficiente
            stock_query = "SELECT stock FROM products WHERE id = %s"
            cursor.execute(stock_query, (product_id,))
            stock_result = cursor.fetchone()
            
            if not stock_result or stock_result[0] < quantity:
                raise Exception(f"Stock insuficiente. Disponible: {stock_result[0] if stock_result else 0}")
            
            # 3. Reducir stock temporalmente (se confirma al finalizar venta)
            
            # 4. Recalcular total de la venta
            self._recalculate_sale_total(cursor, sale_id)
            
            connection.commit()
            return True
            
        except Exception as e:
            connection.rollback()
            print(f"Error al agregar producto: {e}")
            raise e
        finally:
            cursor.close()
            connection.close()
    
    def remove_product_from_current_sale(self, sale_id, product_id, quantity=None):
        """Remover producto de la venta actual"""
        connection = self.db.get_connection()
        cursor = connection.cursor()
        
        try:
            connection.start_transaction()
            
            if quantity is None:
                # Remover todo el producto
                delete_query = "DELETE FROM sale_product WHERE sale_id = %s AND product_id = %s"
                cursor.execute(delete_query, (sale_id, product_id))
            else:
                # Reducir cantidad específica
                get_query = "SELECT quantity FROM sale_product WHERE sale_id = %s AND product_id = %s"
                cursor.execute(get_query, (sale_id, product_id))
                result = cursor.fetchone()
                
                if result:
                    current_quantity = result[0]
                    new_quantity = current_quantity - quantity
                    
                    if new_quantity <= 0:
                        # Si queda en 0 o menos, eliminar
                        delete_query = "DELETE FROM sale_product WHERE sale_id = %s AND product_id = %s"
                        cursor.execute(delete_query, (sale_id, product_id))
                    else:
                        # Actualizar cantidad
                        update_query = """
                        UPDATE sale_product SET quantity = %s 
                        WHERE sale_id = %s AND product_id = %s
                        """
                        cursor.execute(update_query, (new_quantity, sale_id, product_id))
            
            # Recalcular total
            self._recalculate_sale_total(cursor, sale_id)
            
            connection.commit()
            return True
            
        except Exception as e:
            connection.rollback()
            print(f"Error al remover producto: {e}")
            return False
        finally:
            cursor.close()
            connection.close()
    
    def finalize_sale(self, sale_id, payment_method=None, ticket_url=None):
        """Finalizar la venta y actualizar stock - PASO 3"""
        connection = self.db.get_connection()
        cursor = connection.cursor()
        
        try:
            connection.start_transaction()
            
            # 1. Obtener productos de la venta
            products_query = """
            SELECT product_id, quantity FROM sale_product WHERE sale_id = %s
            """
            cursor.execute(products_query, (sale_id,))
            products = cursor.fetchall()
            
            if not products:
                raise Exception("No se puede finalizar una venta sin productos")
            
            # 2. Verificar stock disponible para todos los productos
            for product_id, quantity in products:
                stock_query = "SELECT stock, name FROM products WHERE id = %s"
                cursor.execute(stock_query, (product_id,))
                result = cursor.fetchone()
                
                if not result:
                    raise Exception(f"Producto {product_id} no encontrado")
                
                available_stock, product_name = result
                if available_stock < quantity:
                    raise Exception(f"Stock insuficiente para {product_name}. Disponible: {available_stock}, Requerido: {quantity}")
            
            # 3. Actualizar stock de todos los productos
            for product_id, quantity in products:
                self._update_product_stock(cursor, product_id, -quantity)
            
            # 4. Actualizar información de la venta
            update_sale_query = """
            UPDATE sales 
            SET payment_method = COALESCE(%s, payment_method),
                ticket_url = COALESCE(%s, ticket_url),
                invoice_state = 'pendiente'
            WHERE id = %s
            """
            cursor.execute(update_sale_query, (payment_method, ticket_url, sale_id))
            
            connection.commit()
            return self.get_sale_by_id(sale_id)
            
        except Exception as e:
            connection.rollback()
            print(f"Error al finalizar venta: {e}")
            raise e
        finally:
            cursor.close()
            connection.close()
    
    def cancel_sale(self, sale_id):
        """Cancelar una venta (eliminar sin afectar stock)"""
        try:
            # Como no hemos afectado el stock hasta finalizar,
            # solo eliminamos la venta (CASCADE elimina productos)
            query = "DELETE FROM sales WHERE id = %s AND invoice_state = 'pendiente'"
            cursor = self.db.execute(query, (sale_id,))
            return cursor.rowcount > 0
        except Exception as e:
            print(f"Error al cancelar venta: {e}")
            return False

    # ========== CONSULTAS DE VENTAS ==========
    
    def get_current_sale_details(self, sale_id):
        """Obtener detalles completos de la venta actual"""
        sale = self.get_sale_by_id(sale_id)
        if sale:
            products = self.get_products_by_sale_id(sale_id)
            sale.products = products
            return {
                "sale": sale.to_dict(),
                "products": [p.to_dict() for p in products],
                "total_items": sum(p.quantity for p in products),
                "can_finalize": len(products) > 0
            }
        return None
    
    def get_sale_by_id(self, sale_id):
        """Obtener una venta por ID"""
        query = "SELECT * FROM sales WHERE id = %s"
        try:
            results = self.db.execute(query, (sale_id,))
            if results:
                return Sale.from_dict(results[0])
            return None
        except Exception as e:
            print(f"Error al obtener venta {sale_id}: {e}")
            return None
    
    def get_products_by_sale_id(self, sale_id):
        """Obtener todos los productos de una venta específica"""
        query = "SELECT * FROM sale_product WHERE sale_id = %s"
        try:
            results = self.db.execute(query, (sale_id,))
            return [SaleProduct.from_dict(row) for row in results] if results else []
        except Exception as e:
            print(f"Error al obtener productos de venta {sale_id}: {e}")
            return []

    # ========== VENTAS COMPLETADAS ==========
    
    def get_all_sales(self):
        """Obtener todas las ventas finalizadas"""
        query = "SELECT * FROM sales ORDER BY sale_date DESC"
        try:
            results = self.db.execute(query)
            return [Sale.from_dict(row) for row in results] if results else []
        except Exception as e:
            print(f"Error al obtener ventas: {e}")
            return []
    
    def get_sales_by_date(self, date):
        """Obtener ventas de una fecha específica"""
        query = "SELECT * FROM sales WHERE DATE(sale_date) = %s ORDER BY sale_date DESC"
        try:
            results = self.db.execute(query, (date,))
            return [Sale.from_dict(row) for row in results] if results else []
        except Exception as e:
            print(f"Error al obtener ventas por fecha: {e}")
            return []
    

    # ========== MÉTODOS AUXILIARES ==========
    
    def _update_product_stock(self, cursor, product_id, quantity_change):
        """Actualizar el stock de un producto"""
        update_query = "UPDATE products SET stock = stock + %s WHERE id = %s"
        cursor.execute(update_query, (quantity_change, product_id))
    
    def _recalculate_sale_total(self, cursor, sale_id):
        """Recalcular el total de una venta"""
        total_query = """
        SELECT COALESCE(SUM(quantity * unit_price), 0) as total 
        FROM sale_product 
        WHERE sale_id = %s
        """
        cursor.execute(total_query, (sale_id,))
        result = cursor.fetchone()
        
        new_total = result[0] if result else 0
        update_query = "UPDATE sales SET total_amount = %s WHERE id = %s"
        cursor.execute(update_query, (new_total, sale_id))

    # ========== REPORTES SIMPLES ==========
    
    def get_daily_summary(self, date=None):
        """Resumen de ventas del día"""
        if date is None:
            date = datetime.now().date()
            
        query = """
        SELECT 
            COUNT(*) as total_sales,
            COALESCE(SUM(total_amount), 0) as total_revenue,
            COALESCE(AVG(total_amount), 0) as average_sale
        FROM sales 
        WHERE DATE(sale_date) = %s 
        AND total_amount > 0
        """
        try:
            results = self.db.execute(query, (date,))
            if results:
                return {
                    'date': str(date),
                    'total_sales': results[0]['total_sales'],
                    'total_revenue': float(results[0]['total_revenue']),
                    'average_sale': float(results[0]['average_sale'])
                }
            return {'date': str(date), 'total_sales': 0, 'total_revenue': 0.0, 'average_sale': 0.0}
        except Exception as e:
            print(f"Error al obtener resumen diario: {e}")
            return {'date': str(date), 'total_sales': 0, 'total_revenue': 0.0, 'average_sale': 0.0}