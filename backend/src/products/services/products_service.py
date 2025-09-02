from products.models.product import Product
{"Modulo de users":"En construccion"}
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
        INSERT INTO products (name, barcode, price, stock, url_image)
        VALUES (%s, %s, %s, %s, %s)
        """
        params = (
            data.get("name"),
            data.get("barcode"),
            data.get("price"),
            data.get("stock"),
            data.get("url_image", "") # implementar que si no se manda el parametro o se manda vacio -- > data.get("url_image", "https://server/default-product.png")
            
        )
        try:
            cursor = self.db.execute(query, params) 
            product_id = cursor.lastrowid
            if product_id: 
                return self.get_product_by_id(product_id) 
            return None
        except Exception as e:
            print(f"{e}")
            return None