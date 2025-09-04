## Documentacion de API

| Método                                                                 | Endpoint                       | Descripción                                              | Documentación Específica                  |
|------------------------------------------------------------------------|-------------------------------|----------------------------------------------------------|-------------------------------------------|
| <span style="color:green;">**GET**</span>                             | `/api/productos`              | Obtiene una lista de productos.                          | [Ver detalles](#get-apiproductos)         |
| <span style="color:blue;">**POST**</span>                             | `/api/productos`              | Crea un nuevo producto.                                  | [Ver detalles](#post-apiproductos)        |
| <span style="color:green;">**GET**</span>                             | `/api/productos/:id`          | Obtiene los detalles de un producto específico.          | [Ver detalles](#get-apiproductosid)       |
| <span style="color:orange;">**PUT**</span>                            | `/api/productos/:id`          | Actualiza un producto existente.                         | [Ver detalles](#put-apiproductosid)       |
| <span style="color:red;">**DELETE**</span>                            | `/api/productos/:id`          | Elimina un producto.                                     | [Ver detalles](#delete-apiproductosid)    |
| <span style="color:green;">**GET**</span>                             | `/api/productos/:id/stock`    | Obtiene los movimientos de stock de un producto.         | [Ver detalles](#get-apiproductosidstock)  |
| <span style="color:blue;">**POST**</span>                             | `/api/productos/:id/stock`    | Suma stock a un producto y registra el movimiento.       | [Ver detalles](#post-apiproductosidstock) |


---

## Documentación específica de cada endpoint:

### <span style="color:green;">**GET**</span> `/api/productos`
Obtiene la lista completa de productos.
#### Response 🠮 ``
```json
[
  {
    "id": 1,
    "name": "Coca Cola 500ml",
    "barcode": "7790895001234",
    "price": 150.50,
    "stock": 25,
    "url_image": "https://server/product1.png",
    "category": "Bebidas"
  }
]
```
---

### <span style="color:blue;">**POST**</span> `/api/productos`
Crea un nuevo producto.

#### Request Body
```json
{
  "name": "Coca Cola 500ml",
  "barcode": "7790895001234",
  "price": 150.50,
  "stock": 25,
  "url_image": "https://server/product1.png",
  "category": "Bebidas"
}
```

#### Response 🠮 `201 Created`
```json
{
  "id": 1,
  "name": "Coca Cola 500ml",
  "barcode": "7790895001234",
  "price": 150.50,
  "stock": 25,
  "url_image": "https://server/product1.png",
  "category": "Bebidas"
}
```

⚠️ HTTP Status Codes:
- `409` si el producto ya existe (mismo codigo de barras o nombre)
- `400` si faltan campos obligatorios o son inválidos
---

### <span style="color:green;">**GET**</span> `/api/productos/:id`
Obtiene los detalles de un producto específico.

#### Response 🠮 `200 OK`
```json
{
  "id": 1,
  "name": "Coca Cola 500ml",
  "barcode": "7790895001234",
  "price": 150.50,
  "stock": 25,
  "url_image": "https://server/product1.png",
  "category": "Bebidas"
}
```
⚠️ HTTP Status Codes:
- `404` si el producto no existe
---
### <span style="color:orange;">**PUT**</span>  `/api/productos/:id`
Actualiza un producto existente.
#### Request Body
```json
{
  "name": "Coca Cola 500ml",
  "barcode": "7790895001234",
  "price": 150.50,
  "url_image": "https://server/product1.png",
  "category": "Bebidas"
}
```

#### Response 🠮 `200 OK`
```json
{
  "id": 1,
  "name": "Coca Cola 500ml",
  "barcode": "7790895001234",
  "price": 150.50,
  "stock": 25,
  "url_image": "https://server/product1.png",
  "category": "Bebidas"
}
```
⚠️ HTTP Status Codes:
- `404` si el producto no existe
- `409` si el nuevo nombre o codigo de barras ya existen en otro producto
- `400` si faltan campos obligatorios o son inválidos
---

### <span style="color:red;">**DELETE**</span>  `/api/productos/:id`
Elimina un producto.
#### Response 🠮 `200 OK`
```json
{
  "message": "Producto eliminado exitosamente"
}
```

⚠️ HTTP Status Codes:
- `404` si el producto no existe
---

### <span style="color:green;">**GET**</span> `/api/productos/:id/stock`
Obtiene los movimientos de stock de un producto.
#### Response 🠮 `200 OK`
```json
[
  {
    "id": 1,
    "movement_type": "ingreso",
    "movement_date": "2025-09-04T14:35:00",
    "quantity": 10,
    "user_id": 2,
    "provider_id": 5,
    "notes": "Ingreso inicial de stock"
  }
]
```
⚠️ HTTP Status Codes:
- `404` si el producto no existe
---
### <span style="color:blue;">**POST**</span>   `/api/productos/:id/stock`
Agrega stock a un producto y registra el movimiento.
#### Request Body
```json
{
  "quantity": 10,
  "user_id": 2,
  "provider_id": 5,
  "notes": "Ingreso inicial de stock"
}
```
#### Response 🠮 `200 OK`
```json
{
  "message": "Se agregaron 10 unidades al stock"
}
```
- Cada registro se guarda en la tabla `stock_movements`.

⚠️ HTTP Status Codes:
- `404` si el producto no existe
- `400` cantidad inválida 

---

