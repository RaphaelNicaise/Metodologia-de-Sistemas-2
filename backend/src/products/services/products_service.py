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