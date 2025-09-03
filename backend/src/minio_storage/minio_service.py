from minio import Minio
from dotenv import load_dotenv

import os

load_dotenv('../.env')

class MinioClient:
    """
    Clase singleton para gestionar la conexion con el cliente minio."""
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
        """ Crea los buckets necesarios si no existen """
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
        """
        Guarda el pdf que le mandes en el bucket tickets. 
        A definir si mandamos un path, un archivo directo, etc.
        Depende mucho del momento de creacion del pdf.
        Args:
            ticket_pdf (_type_): _description_
        """
        cls.get_instance().fput_object(
            "tickets", 
            ticket_pdf.filename, 
            ticket_pdf.path
        )