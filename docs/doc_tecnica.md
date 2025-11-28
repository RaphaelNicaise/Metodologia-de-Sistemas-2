API -> [Documentación de API](doc_api.md)

Borrar contenedores y volúmenes:
Los volumenees guardan la información de las bases de datos y MinIO.
```
docker compose down -v
```
Levantar contenedores:

```bash
docker compose up --build -d
```
Lista de servicios:`
- backend: API REST con Flask. (PORT=5000)
- frontend: Front end con React. (PORT=5173) 
- minio: Almacenamiento de objetos. (PORT=9000 & 9001)
- mysql: Base de datos MySQL. (PORT=3306 | 3307)
- phpmyadmin: Interfaz web para MySQL. (PORT=8080)

---
Crear archivo `.env` de configuración a partir de
[.env.template](.env.template) para las variables de entorno.

Testing (con los contenedores levantados):
Se crea un contenedor de backend temporal para los tests, este esta en profile testing por lo que no se ejecuta en el docker compose up normal. Solo se ejecuta si corremos este comando.
```bash
 docker compose run --rm backend pytest -v tests
```