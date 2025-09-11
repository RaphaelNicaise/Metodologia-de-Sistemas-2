Borrar contenedores y volúmenes:
Los volumenes guardan la información de las bases de datos y MinIO.
```
docker compose down -v
```
Levantar contenedores:

```bash
docker compose up --build
```
Ejecutar tests de la API:
```bash
docker-compose run --rm tests-backend pytest -v /app/tests
```

Lista de servicios:
- backend: API REST con Flask. (PORT=5000)
- frontend: Front end con React. (PORT=5173) 
- minio: Almacenamiento de objetos. (PORT=9000 & 9001)
- mysql: Base de datos MySQL. (PORT=3306)
- phpmyadmin: Interfaz web para MySQL. (PORT=8080)

---
Crear archivo `.env` de configuración a partir de
[.env.template](.env.template.env) para las variables de entorno.