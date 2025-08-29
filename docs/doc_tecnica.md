Levantar contenedores:
```bash
docker compose up --build
```
Lista de servicios:
- backend: API REST con Flask. (PORT=5000)
- frontend: 
- minio: Almacenamiento de objetos. (PORT=9000 & 9001)
- mongo: Base de datos MongoDB. (PORT=27017)
- mysql: Base de datos MySQL. (PORT=3306)
- phpmyadmin: Interfaz web para MySQL. (PORT=8080)

---
Crear archivo `.env` de configuración a partir de
[.env.template](.env.template.env) para las variables de entorno.