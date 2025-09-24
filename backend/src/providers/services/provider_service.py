from src.providers.models.provider import Provider
import mysql.connector
from src.db import Database

class ProviderService:
    def __init__(self):
        self.db = Database()

    def get_providers(self):
        query = "SELECT * FROM providers"
        results = self.db.execute(query)
        providers = [Provider(**row) for row in results]
        return providers
    
    def get_provider_by_id(self, provider_id):
        query = "SELECT * FROM providers WHERE id = %s"
        cursor = self.db.execute(query, (provider_id,))
        row = cursor.fetchone()
        if row:
            return Provider(**row)
        return None
    
    def create_provider(self, data):
        query = """
        INSERT INTO providers (name, description, phone_number, contact_email, address)
        VALUES (%s, %s, %s, %s, %s)
        """
        params = (
            data.get("name"),
            data.get("description"),
            data.get("phone_number"),
            data.get("contact_email"),
            data.get("address")
        )
        try:
            cursor = self.db.execute(query, params) 
            provider_id = cursor.lastrowid
            if provider_id: 
                return self.get_provider_by_id(provider_id) 
            return None
        except mysql.connector.IntegrityError as e:
            if e.errno == 1062:
                return {"error": "DUPLICATE"}
            return {"error": "DB_ERROR"}