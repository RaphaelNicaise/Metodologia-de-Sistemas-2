from products.models.product import Product
import mysql.connector
from db import Database



class ProductoService:
    def __init__(self,):
        self.db = Database() # Instancia de la clase Database

    def get_all_products(self):
        query = "SELECT * FROM products"
        results = self.db.execute(query)
        products = [Product(**row) for row in results]
        return products
    
    def get_product_by_id(self, product_id):
        query = "SELECT * FROM products WHERE id = %s"
        cursor = self.db.execute(query, (product_id,))
        row = cursor.fetchone()
        if row:
            return Product(**row)
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
            data.get("url_image", ""), # implementar que si no se manda el parametro o se manda vacio -- > data.get("url_image", "https://server/default-product.png")
            data.get("category")
        )
        try:
            cursor = self.db.execute(query, params) 
            product_id = cursor.lastrowid
            if product_id: 
                return self.get_product_by_id(product_id) 
            return None
        except mysql.connector.IntegrityError as e:
            if e.errno == 1062:
                return {"error": "DUPLICATE"}
            return {"error": "DB_ERROR"}
        

    def update_product(self, product_id, data):
        query = """
        UPDATE products
        SET name = %s, barcode = %s, price = %s, stock = %s, image_url = %s, category = %s
        WHERE id = %s
        """
        params = (
            data.get("name"),
            data.get("barcode"),
            data.get("price"),
            data.get("stock"),
            data.get("image_url", ""),
            data.get("category"),
            product_id
        )
        try:
            cursor = self.db.execute(query, params)

            if cursor.rowcount > 0:
                return self.get_product_by_id(product_id) 
            else:
                return "NOT_FOUND"  
        except mysql.connector.IntegrityError as e:
            if e.errno == 1062:  
                return "DUPLICATE"
            return "ERROR"
        except Exception as e:
            print(f"{e}")
            return "ERROR"

        
    def delete_product(self, product_id):
        query = "DELETE FROM products WHERE id = %s"
        try:
            cursor = self.db.execute(query, (product_id,))
            if cursor.rowcount > 0:
                return "DELETED"
            else:
                return "NOT_FOUND"
        except Exception as e:
            print(f"{e}")
            return "ERROR"       
