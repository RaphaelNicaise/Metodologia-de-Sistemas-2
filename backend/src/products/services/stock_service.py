from db import Database

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
