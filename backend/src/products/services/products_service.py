from src.products.models.product import Product
import mysql.connector
from src.db import Database
from src.db_lock import db_lock

class ProductoService:
    def __init__(self):
        self.db = Database()

    def get_all_products(self):
        with db_lock:
            query = "SELECT * FROM products"
            try:
                cursor = self.db.conn.cursor(dictionary=True, buffered=True)
                cursor.execute(query)
                results = cursor.fetchall()
                cursor.close()
                return [Product(**row) for row in results]
            except Exception as e:
                print(f"Error getting products: {e}")
                return []

    def get_product_by_id(self, product_id):
        with db_lock:
            query = "SELECT * FROM products WHERE id = %s"
            try:
                cursor = self.db.conn.cursor(dictionary=True, buffered=True)
                cursor.execute(query, (product_id,))
                row = cursor.fetchone()
                cursor.close()
                if row:
                    return Product(**row)
                return None
            except Exception:
                return None
    
    def create_product(self, data):
        query = """
        INSERT INTO products (name, barcode, price, stock, url_image, category)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        params = (
            data.get("name"),
            data.get("barcode"),
            data.get("price"),
            data.get("stock"),
            data.get("url_image", ""), 
            data.get("category")
        )
        try:
            cursor = self.db.execute(query, params) 
            product_id = cursor.lastrowid
            cursor.close()  
            if product_id: 
                return self.get_product_by_id(product_id) 
            return None
        except mysql.connector.IntegrityError as e:
            if e.errno == 1062:
                return {"error": "DUPLICATE"}
            return {"error": "DB_ERROR"}
        

    def update_product(self, product_id, data):
        product = self.get_product_by_id(product_id) 
        if not product:
            return "NOT_FOUND"

        updated_data = product.to_dict()

        # Evitar que se actualice stock aunque venga en data
        data = {k: v for k, v in data.items() if k != "stock"}
        updated_data.update(data)

        query = """
        UPDATE products
        SET name=%s, barcode=%s, price=%s, url_image=%s, category=%s
        WHERE id=%s
        """
        params = (
            updated_data["name"],
            updated_data["barcode"],
            updated_data["price"],
            updated_data["url_image"],
            updated_data["category"],
            product_id,
        )
        try:
            cursor = self.db.execute(query, params)
            cursor.close()
            return self.get_product_by_id(product_id)
        except mysql.connector.IntegrityError as e:
            if e.errno == 1062:
                return "DUPLICATE"
            return "ERROR"

    def delete_product(self, product_id):
        query = "DELETE FROM products WHERE id = %s"
        try:
            cursor = self.db.execute(query, (product_id,))
            rowcount = cursor.rowcount
            cursor.close() 
            if rowcount > 0:
                return "DELETED"
            else:
                return "NOT_FOUND"
        except Exception as e:
            print(f"{e}")
            return "ERROR"