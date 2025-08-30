import mysql.connector
from mysql.connector import Error

class Database:
    _instance = None  # atributo de clase para almacenar la única instancia

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:  
            cls._instance = super(Database, cls).__new__(cls)
        return cls._instance

    def __init__(self, host="localhost", user="root", password="", database="mi_base"):
        # Inicializamos solo una vez
        if not hasattr(self, "initialized"):  
            self.host = host
            self.user = user
            self.password = password
            self.database = database
            self.conn = None
            self.cursor = None
            self.connect()
            self.initialized = True  # evita reinicialización

    def connect(self):
        try:
            if not self.conn or not self.conn.is_connected():
                self.conn = mysql.connector.connect(
                    host=self.host,
                    user=self.user,
                    password=self.password,
                    database=self.database
                )
                self.cursor = self.conn.cursor(dictionary=True)
        except Error as e:
            print(f"Error al conectar con MySQL: {e}")

    def execute(self, query, params=None):
        self.cursor.execute(query, params or ())
        self.conn.commit()
        return self.cursor

    def close(self):
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
