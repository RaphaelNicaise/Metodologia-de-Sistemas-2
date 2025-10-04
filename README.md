# Metodologia-de-Sistemas-2

### Colaboradores

- [Nicaise Raphael](https://github.com/RaphaelNicaise)
- [Fernandez Felipe](https://github.com/felifernandezz)
- [Barbero Agus](https://github.com/agustinbarbero)
- [Lopez Luciano](https://github.com/Luchoolopez)

### Patrones a utilizar

Tanto en el archivo [db.py](./backend/src/db.py) como en el archivo [minio_service.py](./backend/src/minio_storage/minio_service.py) se implementa el `patrón Singleton` para la creación de las instancias de la base de datos y del cliente de MinIO respectivamente. Este patrón asegura que solo exista una única instancia de estos servicios en toda la aplicación, evitando problemas de concurrencia y optimizando el uso de recursos.

```python

# Conexión a la base de datos MySQL Singleton
class Database:
    _instance = None  # atributo de clase para almacenar la única instancia

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:  
            cls._instance = super(Database, cls).__new__(cls)
        return cls._instance

    def __init__(self, host=None, user="root", password=None, database=None, retries=5, delay=8):
        # Inicializamos solo una vez
        if not hasattr(self, "initialized"):  
            self.host =  os.getenv("MYSQL_HOST","mysql")
            self.user = user
            self.password = os.getenv("MYSQL_ROOT_PASSWORD")
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

```

```python
class MinioClient:

    _instance = None
    
    def __init__(self):
        if not hasattr(self, "initialized"):
            access_key = os.getenv("MINIO_ROOT_USER")
            secret_key = os.getenv("MINIO_ROOT_PASSWORD")
            endpoint = os.getenv("MINIO_ENDPOINT")
            self.client = Minio(
                endpoint,
                access_key=access_key,
                secret_key=secret_key,
                secure=False
            )
            MinioClient._instance = self
            self.init_buckets()
            self.initialized = True
            print("MinIO Client operando correctamente")

    def init_buckets(self):

        buckets = ["tickets", "images"]
        for bucket in buckets:
            if not self.client.bucket_exists(bucket):
                self.client.make_bucket(bucket)

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls()
        return cls._instance.client
    
    @classmethod
    def guardar_ticket(cls, ticket_pdf): # implementar

        cls.get_instance().fput_object(
            "tickets", 
            ticket_pdf.filename, 
            ticket_pdf.path
        )
```

---

En el archivo [app.py](./backend/src/app.py) se implementa el `patrón Factory` para la creación de la aplicación Flask. Este patrón permite configurar la aplicación de manera flexible, adaptándose a diferentes entornos (desarrollo, pruebas, producción) mediante el parámetro "testing". Aparte se utilizan los patrones `Singleton` y `Builder` para la inicialización de servicios como la base de datos y el cliente de MinIO, asegurando que solo exista una instancia de estos servicios en toda la app.
```python
def create_app(testing: bool = False): # Funcion que usa patron factory

     app = Flask(__name__)

     if testing:
          app.config["TESTING"] = True
          app.config["DEBUG"] = True
     else:
          app.config["TESTING"] = False
          app.config["DEBUG"] = False

     # inicializar servicios singleton con el patron builder
     Database()  # instancia del cliente de MySQL
     if not testing:
          MinioClient() # instancia el singleton de MinIO

     CORS(app)

     # register blueprints
     app.register_blueprint(accounting_bp, url_prefix="/api/contabilidad")
     app.register_blueprint(config_bp)
     app.register_blueprint(products_bp, url_prefix="/api/productos")
     app.register_blueprint(providers_bp, url_prefix="/api/proveedores")
     app.register_blueprint(sales_bp)
     app.register_blueprint(users_bp)

     return app
```

Otro patron que podriamos implementar seria `Facade`

El patrón Facade permite simplificar la interacción entre múltiples módulos del sistema, como productos, ventas, contabilidad y almacenamiento de documentos. Implementando una clase como `SalesFacade`, se puede centralizar y unificar operaciones complejas (por ejemplo, procesar una venta o devolución) en métodos simples, reduciendo el acoplamiento y la repetición de código. Esto facilita el mantenimiento, mejora la testabilidad y proporciona un único punto de control para operaciones críticas que involucran varios servicios, como ventas masivas, cierre de caja o generacióon de reportes.