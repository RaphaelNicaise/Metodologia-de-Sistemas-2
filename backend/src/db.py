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
    _testing_mode = False

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:  
            cls._instance = super(Database, cls).__new__(cls)
        return cls._instance

    def __init__(self,testing=False,host=None, user="root", password=None, database=None, retries=5, delay=8):
        # Inicializamos solo una vez
        if not hasattr(self, "initialized"):  
            self.host =  os.getenv("MYSQL_HOST","mysql")
            self.user = user
            self.password = os.getenv("MYSQL_ROOT_PASSWORD")

            if testing:
                self.database = os.getenv("MYSQL_TEST_DATABASE")
            else:
                self.database = os.getenv("MYSQL_DATABASE")
                
            self.retries = retries
            self.delay = delay
            self.conn = None
            self.cursor = None
            self.connect_with_retries()
            self.initialized = True  # evita reinicialización

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

    def get_connection(self):
        return self.conn