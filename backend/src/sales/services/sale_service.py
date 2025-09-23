from sales.models.sale_model import Sale
from sales.models.sale_product import SaleProduct
from products.services.products_service import ProductoService
from db import Database
from datetime import datetime

class SaleService:
    def __init__(self):
        self.db = Database()
        self.product_service = ProductoService()

    # ----------- METODO PRINCIPAL -----------
    
    def create_sale(self, sale_data, products_data):
        """Crear venta completa con productos."""
        connection = self.db.get_connection()
        cursor = connection.cursor()
        
        try:
            connection.start_transaction()
            
            # 1. Validar que todos los productos existen y tienen stock
            for product_data in products_data:
                product = self.product_service.get_product_by_id(product_data.get('product_id'))
                if not product:
                    raise Exception(f"Producto {product_data.get('product_id')} no encontrado")
                
                quantity = product_data.get('quantity')
                if product.stock < quantity:
                    raise Exception(f"Stock insuficiente para {product.name}. Disponible: {product.stock}, Solicitado: {quantity}")
            
            # 2. Calcular total
            total_amount = sum(
                product_data.get('quantity') * product_data.get('unit_price') 
                for product_data in products_data
            )
            
            # 3. Crear la venta
            sale_query = """
            INSERT INTO sales (sale_date, total_amount, payment_method, ticket_url, invoice_state)
            VALUES (%s, %s, %s, %s, %s)
            """
            sale_params = (
                sale_data.get("sale_date", datetime.now()),
                total_amount,
                sale_data.get("payment_method", "efectivo"),
                sale_data.get("ticket_url", ""),
                sale_data.get("invoice_state", "pendiente")
            )
            
            cursor.execute(sale_query, sale_params)
            sale_id = cursor.lastrowid
            
            # 4. Insertar productos de la venta
            for product_data in products_data:
                product_query = """
                INSERT INTO sale_product (sale_id, product_id, quantity, unit_price)
                VALUES (%s, %s, %s, %s)
                """
                product_params = (
                    sale_id,
                    product_data.get("product_id"),
                    product_data.get("quantity"),
                    product_data.get("unit_price")
                )
                cursor.execute(product_query, product_params)
                
                # 5. Reducir stock
                self._update_product_stock(cursor, product_data.get("product_id"), -product_data.get("quantity"))
            
            connection.commit()
            return self.get_sale_by_id(sale_id)
            
        except Exception as e:
            connection.rollback()
            print(f"Error al crear venta: {e}")
            raise e
        finally:
            cursor.close()
            connection.close()

    # ------------ METODOS GET ------------
    
    def get_sale_by_id(self, sale_id):
        query = "SELECT * FROM sales WHERE id = %s"
        try:
            results = self.db.execute(query, (sale_id,))
            if results:
                return Sale.from_dict(results[0])
            return None
        except Exception as e:
            print(f"Error al obtener venta {sale_id}: {e}")
            return None
    
    def get_sale_with_products(self, sale_id):
        sale = self.get_sale_by_id(sale_id)
        if sale:
            products = self.get_products_by_sale_id(sale_id)
            return {
                "sale": sale.to_dict(),
                "products": [p.to_dict() for p in products],
                "total_items": sum(p.quantity for p in products)
            }
        return None
    
    def get_products_by_sale_id(self, sale_id):
        query = "SELECT * FROM sale_product WHERE sale_id = %s"
        try:
            results = self.db.execute(query, (sale_id,))
            return [SaleProduct.from_dict(row) for row in results] if results else []
        except Exception as e:
            print(f"Error al obtener productos de venta {sale_id}: {e}")
            return []

    def get_all_sales(self):
        query = "SELECT * FROM sales ORDER BY sale_date DESC"
        try:
            results = self.db.execute(query)
            return [Sale.from_dict(row) for row in results] if results else []
        except Exception as e:
            print(f"Error al obtener ventas: {e}")
            return []
    
    def get_sales_by_date(self, date):
        query = "SELECT * FROM sales WHERE DATE(sale_date) = %s ORDER BY sale_date DESC"
        try:
            results = self.db.execute(query, (date,))
            return [Sale.from_dict(row) for row in results] if results else []
        except Exception as e:
            print(f"Error al obtener ventas por fecha: {e}")
            return []
        
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

    # ------------ METODOS DE UPDATE Y DELETE ------------
    
    def update_sale_status(self, sale_id, invoice_state=None, ticket_url=None):
        """Actualizar el estado de facturación o URL del ticket"""
        query = """
        UPDATE sales 
        SET invoice_state = COALESCE(%s, invoice_state),
            ticket_url = COALESCE(%s, ticket_url)
        WHERE id = %s
        """
        try:
            cursor = self.db.execute(query, (invoice_state, ticket_url, sale_id))
            if cursor.rowcount > 0:
                return self.get_sale_by_id(sale_id)
            return None
        except Exception as e:
            print(f"Error al actualizar venta {sale_id}: {e}")
            return None

    def delete_sale(self, sale_id):
        """Eliminar una venta y restaurar el stock"""
        connection = self.db.get_connection()
        cursor = connection.cursor()
        
        try:
            connection.start_transaction()
            
            # 1. Obtener productos de la venta
            products_query = "SELECT product_id, quantity FROM sale_product WHERE sale_id = %s"
            cursor.execute(products_query, (sale_id,))
            products = cursor.fetchall()
            
            # 2. Restaurar stock
            for product_id, quantity in products:
                self._update_product_stock(cursor, product_id, quantity)
            
            # 3. Eliminar venta (se eliminan los productos automaticamente)
            delete_query = "DELETE FROM sales WHERE id = %s"
            cursor.execute(delete_query, (sale_id,))
            
            success = cursor.rowcount > 0
            connection.commit()
            return success
            
        except Exception as e:
            connection.rollback()
            print(f"Error al eliminar venta {sale_id}: {e}")
            return False
        finally:
            cursor.close()
            connection.close()
  
    # ========== METODO AUXILIAR ==========
    
    def _update_product_stock(self, cursor, product_id, quantity_change):
        """Actualizar el stock de un producto"""
        update_query = "UPDATE products SET stock = stock + %s WHERE id = %s"
        cursor.execute(update_query, (quantity_change, product_id))