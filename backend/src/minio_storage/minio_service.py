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