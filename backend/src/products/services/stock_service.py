from src.db import Database

class StockService:
    def __init__(self):
        self.db = Database()

    def add_stock(self, product_id, quantity, user_id=None, provider_id=None, notes=None):
        if quantity <= 0:
            return "INVALID_QUANTITY"

        product_query = "SELECT id FROM products WHERE id = %s"
        cursor = self.db.execute(product_query, (product_id,))
        if cursor.fetchone() is None:
            return "NOT_FOUND"

        insert_query = """
        INSERT INTO stock_movements (product_id, movement_type, quantity, user_id, provider_id, notes)
        VALUES (%s, 'ingreso', %s, %s, %s, %s)
        """
        try:
            self.db.execute(insert_query, (product_id, quantity, user_id, provider_id, notes))
            update_query = "UPDATE products SET stock = stock + %s WHERE id = %s"
            self.db.execute(update_query, (quantity, product_id))
            return "OK"
        except Exception as e:
            print(e)
            return "ERROR"
    
    def reduce_stock(self, product_id, quantity, user_id=None, notes=None):
        """
        Reduce el stock de un producto. Se usa para ventas o salidas de inventario.
        
        """
        if quantity <= 0:
            return "INVALID_QUANTITY"

        # Verificar que el producto existe y obtener stock actual
        product_query = "SELECT id, stock FROM products WHERE id = %s"
        cursor = self.db.execute(product_query, (product_id,))
        product = cursor.fetchone()
        
        if product is None:
            return "NOT_FOUND"
        
        current_stock = product['stock']
        
        # Verificar que hay stock suficiente
        if current_stock < quantity:
            return "INSUFFICIENT_STOCK"

        insert_query = """
        INSERT INTO stock_movements (product_id, movement_type, quantity, user_id, notes)
        VALUES (%s, 'salida', %s, %s, %s)
        """
        try:
            self.db.execute(insert_query, (product_id, quantity, user_id, notes))
            update_query = "UPDATE products SET stock = stock - %s WHERE id = %s"
            self.db.execute(update_query, (quantity, product_id))
            return "OK"
        except Exception as e:
            print(e)
            return "ERROR"
        
    def get_movements(self, product_id):
        product_query = "SELECT id FROM products WHERE id = %s"
        cursor = self.db.execute(product_query, (product_id,))
        if cursor.fetchone() is None:
            return "NOT_FOUND"

        movements_query = """
        SELECT id, movement_type, movement_date, quantity, user_id, provider_id, notes
        FROM stock_movements
        WHERE product_id = %s
        ORDER BY movement_date DESC
        """
        cursor = self.db.execute(movements_query, (product_id,))
        movements = cursor.fetchall()
        return movements
