from minio import Minio
from dotenv import load_dotenv

import os

load_dotenv('../.env')

class MinioClient:
    """
    Clase singleton para gestionar la conexion con el cliente minio."""
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            access_key = os.getenv("MINIO_ROOT_USER")
            secret_key = os.getenv("MINIO_ROOT_PASSWORD")
            endpoint = os.getenv("MINIO_ENDPOINT")

            cls._instance = Minio(
                endpoint, 
                access_key=access_key,
                secret_key=secret_key,
                secure=False
            )
        return cls._instance
    
    @classmethod
    def guardar_ticket(cls, ticket_pdf):
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