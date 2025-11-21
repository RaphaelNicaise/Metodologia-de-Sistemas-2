from src.sales.models.sale_model import Sale
from src.sales.models.sale_product import SaleProduct
from src.products.services.products_service import ProductoService
from src.products.services.stock_service import StockService
from src.db import Database
from src.db_lock import db_lock
from datetime import datetime

class SaleService:
    def __init__(self):
        self.db = Database()
        self.product_service = ProductoService()
        self.stock_service = StockService()

    def create_sale(self, sale_data, products_data):
        """Crear venta completa con productos."""
        
        current_date = datetime.now()

        with db_lock: 
            connection = self.db.get_connection()
            
            try:
                connection.rollback()
            except:
                pass

            cursor = connection.cursor(dictionary=True, buffered=True)
            
            try:
                connection.start_transaction()
                
                # 1. Validar productos
                for product_data in products_data:
                    product = self.product_service.get_product_by_id(product_data.get('product_id'))
                    if not product:
                        raise Exception(f"Producto {product_data.get('product_id')} no encontrado")
                    
                    quantity = int(product_data.get('quantity'))
                    if product.stock < quantity:
                        raise Exception(f"Stock insuficiente para {product.name}")
                
                # 2. Calcular total
                total_amount = sum(
                    int(p.get('quantity')) * float(p.get('unit_price')) 
                    for p in products_data
                )
                
                # 3. Crear la venta
                sale_query = """
                INSERT INTO sales (sale_date, total_amount, payment_method, ticket_url, invoice_state)
                VALUES (%s, %s, %s, %s, %s)
                """
                
                payment_method = sale_data.get("payment_method", "efectivo")
                ticket_url = sale_data.get("ticket_url", "")
                invoice_state = sale_data.get("invoice_state", "pendiente")

                sale_params = (
                    current_date,
                    total_amount,
                    payment_method,
                    ticket_url,
                    invoice_state
                )
                
                cursor.execute(sale_query, sale_params)
                sale_id = cursor.lastrowid
                
                # 4. Insertar productos
                for product_data in products_data:
                    product_query = """
                    INSERT INTO sale_product (sale_id, product_id, quantity, unit_price)
                    VALUES (%s, %s, %s, %s)
                    """
                    product_params = (
                        sale_id,
                        product_data.get("product_id"),
                        int(product_data.get("quantity")),
                        float(product_data.get("unit_price"))
                    )
                    cursor.execute(product_query, product_params)
                    
                    # 5. Reducir stock
                    stock_result = self.stock_service.reduce_stock(
                        product_id=product_data.get("product_id"),
                        quantity=int(product_data.get("quantity")),
                        user_id=sale_data.get("user_id"),  
                        notes=f"Venta #{sale_id}"
                    )
                    
                    if stock_result != "OK":
                        raise Exception(f"Error stock: {stock_result}")

                connection.commit()
                cursor.close() 
                new_sale = Sale(
                    id=sale_id,
                    sale_date=current_date,
                    total_amount=total_amount,
                    payment_method=payment_method,
                    ticket_url=ticket_url,
                    invoice_state=invoice_state
                )
                return new_sale
                
            except Exception as e:
                connection.rollback()
                print(f"Error al crear venta: {e}")
                raise e 
            finally:
                try:
                    cursor.close()
                except:
                    pass

    def get_sale_by_id(self, sale_id):
        query = "SELECT * FROM sales WHERE id = %s"
        try:
            results = self.db.execute(query, (sale_id,))
            if hasattr(results, 'fetchone'):
                row = results.fetchone()
                try: results.close() 
                except: pass
                if row: return Sale.from_dict(row)
            elif isinstance(results, list) and len(results) > 0:
                return Sale.from_dict(results[0])
            return None
        except Exception as e:
            print(f"Error al obtener venta {sale_id}: {e}")
            return None
            
    def get_all_sales(self):
        query = "SELECT * FROM sales ORDER BY sale_date DESC"
        try:
            cursor = self.db.execute(query)
            results = cursor.fetchall()
            cursor.close()
            return [Sale.from_dict(row) for row in results]
        except Exception as e:
            print(f"Error al obtener ventas: {e}")
            return []
    
    def get_sales_by_date(self, date):
        query = "SELECT * FROM sales WHERE DATE(sale_date) = %s ORDER BY sale_date DESC"
        try:
            cursor = self.db.execute(query, (date,))
            results = cursor.fetchall()
            cursor.close()
            return [Sale.from_dict(row) for row in results]
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
            cursor = self.db.execute(query, (date,))
            if cursor:
                result = cursor.fetchone()
                cursor.close()
                if result:
                    return {
                        'date': str(date),
                        'total_sales': result['total_sales'],
                        'total_revenue': float(result['total_revenue']),
                        'average_sale': float(result['average_sale'])
                    }
            return {'date': str(date), 'total_sales': 0, 'total_revenue': 0.0, 'average_sale': 0.0}
        except Exception as e:
            print(f"Error al obtener resumen diario: {e}")
            return {'date': str(date), 'total_sales': 0, 'total_revenue': 0.0, 'average_sale': 0.0}

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
            cursor = self.db.execute(query, (sale_id,))
            results = cursor.fetchall()
            cursor.close()
            return [SaleProduct.from_dict(row) for row in results]
        except Exception as e:
            print(f"Error al obtener productos de venta {sale_id}: {e}")
            return []

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
            cursor.close()
            return self.get_sale_by_id(sale_id)
        except Exception as e:
            print(f"Error al actualizar venta {sale_id}: {e}")
            return None

    def delete_sale(self, sale_id):
        with db_lock:
            connection = self.db.get_connection()
            cursor = connection.cursor()
            try:
                connection.start_transaction()
                
                products_query = "SELECT product_id, quantity FROM sale_product WHERE sale_id = %s"
                cursor.execute(products_query, (sale_id,))
                products = cursor.fetchall()
                
                for row in products:
                    pid = row['product_id'] if isinstance(row, dict) else row[0]
                    qty = row['quantity'] if isinstance(row, dict) else row[1]

                    self.stock_service.add_stock(
                        product_id=pid,
                        quantity=qty,
                        user_id=None,  
                        provider_id=None,
                        notes=f"Devolución por eliminación de venta #{sale_id}"
                    )
                
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