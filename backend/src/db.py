import mysql.connector
from mysql.connector import Error

import os
from dotenv import load_dotenv
import time



load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../../.env'))

print(f"HOST {os.getenv('MYSQL_HOST')}")
print(f"DATABASE {os.getenv('MYSQL_DATABASE')}")
print(f"PORT {os.getenv('MYSQL_PORT')}")
# Conexión a la base de datos MySQL Singleton
class Database:
    _instance = None  # atributo de clase para almacenar la única instancia

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:  
            cls._instance = super(Database, cls).__new__(cls)
        return cls._instance

    def __init__(self, host=None, user="root", password=None, database=None, retries=5, delay=8):
        if not hasattr(self, "initialized"):
                    self.host = host or os.getenv("MYSQL_HOST", "mysql")
                    self.user = user
                    self.password = password or os.getenv("MYSQL_ROOT_PASSWORD")
                    
                    # Escoge base según entorno
                    env = os.getenv("FLASK_ENV", "development")
                    if env == "testing":
                        self.database = os.getenv("MYSQL_TEST_DATABASE", "db_test")
                    else:
                        self.database = os.getenv("MYSQL_DATABASE", "db")
                    
                    self.retries = retries
                    self.delay = delay
                    self.conn = None
                    self.cursor = None
                    self.connect_with_retries()
                    self.initialized = True

    def connect_with_retries(self):
        attempts = 0
        while attempts < self.retries:
            try:
                self.conn = mysql.connector.connect(
                    host=self.host,
                    user=self.user,
                    password=self.password,
                    database=self.database
                )
                self.cursor = self.conn.cursor(dictionary=True)
                print(f"MySQL conectado correctamente a {self.host}:{self.database}")
                return
            except Error as e:
                attempts += 1
                print(f"Intento {attempts}: MySQL no disponible ({e}), reintentando en {self.delay}s...")
                time.sleep(self.delay)
        raise ConnectionError(f"No se pudo conectar a MySQL después de {self.retries} intentos.")


    def execute(self, query, params=None):
        cursor = self.conn.cursor(dictionary=True)  # cursor nuevo como diccionario
        cursor.execute(query, params or ())
        
        if not query.strip().lower().startswith("select"):
            self.conn.commit()
        
        return cursor

    def close(self):
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
