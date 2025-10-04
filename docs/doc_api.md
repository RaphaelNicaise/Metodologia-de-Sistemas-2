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
  "name": "nombre",
  "barcode": "1234567890123",
  "price": 59.99,
  "stock": 25,
  "url_image": "",
  "category": "Test"
}
```

#### Response 🠮 `201 Created`
```json
{
  "id": 1,
  "name": "nombre",
  "barcode": "1234567890123",
  "price": 59.99,
  "stock": 25,
  "url_image": "",
  "category": "Test"
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
  // pones solo el campo que queres cambiar
  // no es necesario enviar todos los campos
  // no poner stock
  "price": 175.00,
  "name": "Coca Cola 600ml"
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
        "id": 2,
        "movement_date": "Tue, 23 Sep 2025 18:15:51 GMT",
        "movement_type": "ingreso",
        "notes": "Compra semanal de proveedor X",
        "provider_id": 1,
        "quantity": 3,
        "user_id": 1
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
  "quantity": 3,
  "user_id": 1,
  "provider_id": 1,
  "notes": "Compra semanal de proveedor X"
}
```
#### Response 🠮 `200 OK`
```json
{
  "message": "Se agregaron 3 unidades al stock"
}
```
- Cada registro se guarda en la tabla `stock_movements`.

⚠️ HTTP Status Codes:
- `404` si el producto no existe
- `400` cantidad inválida 

---

## Documentación de API - Ventas (Sales)

| Método                                                                 | Endpoint                       | Descripción                                              | Documentación Específica                  |
|------------------------------------------------------------------------|-------------------------------|----------------------------------------------------------|-------------------------------------------|
| <span style="color:blue;">**POST**</span>                             | `/api/sales`                  | Crea una venta completa con productos.                   | [Ver detalles](#post-apisales)           |
| <span style="color:green;">**GET**</span>                             | `/api/sales`                  | Obtiene todas las ventas.                               | [Ver detalles](#get-apisales)            |
| <span style="color:green;">**GET**</span>                             | `/api/sales/:id`              | Obtiene una venta específica.                           | [Ver detalles](#get-apisalesid)          |
| <span style="color:green;">**GET**</span>                             | `/api/sales/:id/complete`     | Obtiene venta completa con productos.                   | [Ver detalles](#get-apisalesidcomplete)  |
| <span style="color:green;">**GET**</span>                             | `/api/sales/:id/products`     | Obtiene solo los productos de una venta.                | [Ver detalles](#get-apisalesidproducts)  |
| <span style="color:green;">**GET**</span>                             | `/api/sales/by-date/:date`    | Obtiene ventas de una fecha específica.                 | [Ver detalles](#get-apisalesbydate)      |
| <span style="color:green;">**GET**</span>                             | `/api/sales/today`            | Obtiene ventas de hoy con resumen.                      | [Ver detalles](#get-apisalestoday)       |
| <span style="color:green;">**GET**</span>                             | `/api/sales/summary`          | Obtiene resumen de ventas del día.                      | [Ver detalles](#get-apisalessummary)     |
| <span style="color:orange;">**PUT**</span>                            | `/api/sales/:id/status`       | Actualiza estado de facturación o ticket.               | [Ver detalles](#put-apisalesidstatus)    |
| <span style="color:red;">**DELETE**</span>                            | `/api/sales/:id`              | Elimina venta y restaura stock.                         | [Ver detalles](#delete-apisalesid)       |

---

## Documentación específica - Ventas:

### <span style="color:blue;">**POST**</span> `/api/sales`
Crea una venta completa con productos. El total se calcula automáticamente.

#### Request Body
```json
{
  "payment_method": "efectivo",
  "ticket_url": "https://server/tickets/venta123.pdf",
  "invoice_state": "pendiente",
  "products": [
    {
      "product_id": 15,
      "quantity": 2,
      "unit_price": 800.00
    },
    {
      "product_id": 23,
      "quantity": 1,
      "unit_price": 900.00
    }
  ]
}
```

#### Response 🠮 `201 Created`
```json
{
  "success": true,
  "message": "Venta creada correctamente",
  "sale": {
    "id": 123,
    "sale_date": "2025-01-15T10:30:00",
    "total_amount": 2500.00,
    "payment_method": "efectivo",
    "ticket_url": "https://server/tickets/venta123.pdf",
    "invoice_state": "pendiente"
  }
}
```

**Notas:**
- Se valida automáticamente stock y existencia de productos
- Se reduce el stock automáticamente
- Campos opcionales: `payment_method` (default: "efectivo"), `ticket_url`, `invoice_state` (default: "pendiente")

⚠️ HTTP Status Codes:
- `500` si falta stock, producto no existe, o error de validación

---

### <span style="color:green;">**GET**</span> `/api/sales`
Obtiene todas las ventas ordenadas por fecha descendente.

#### Response 🠮 `200 OK`
```json
{
  "success": true,
  "sales": [
    {
      "id": 123,
      "sale_date": "2025-01-15T10:30:00",
      "total_amount": 2500.00,
      "payment_method": "efectivo",
      "ticket_url": "",
      "invoice_state": "pendiente"
    }
  ],
  "total": 1
}
```

---

### <span style="color:green;">**GET**</span> `/api/sales/:id`
Obtiene los detalles básicos de una venta específica.

#### Response 🠮 `200 OK`
```json
{
  "success": true,
  "sale": {
    "id": 123,
    "sale_date": "2025-01-15T10:30:00",
    "total_amount": 2500.00,
    "payment_method": "efectivo",
    "ticket_url": "",
    "invoice_state": "pendiente"
  }
}
```

⚠️ HTTP Status Codes:
- `404` si la venta no existe

---

### <span style="color:green;">**GET**</span> `/api/sales/:id/complete`
Obtiene venta completa con información de productos.

#### Response 🠮 `200 OK`
```json
{
  "success": true,
  "data": {
    "sale": {
      "id": 123,
      "sale_date": "2025-01-15T10:30:00",
      "total_amount": 2500.00,
      "payment_method": "efectivo",
      "ticket_url": "",
      "invoice_state": "pendiente"
    },
    "products": [
      {
        "sale_id": 123,
        "product_id": 15,
        "quantity": 2,
        "unit_price": 800.00
      },
      {
        "sale_id": 123,
        "product_id": 23,
        "quantity": 1,
        "unit_price": 900.00
      }
    ],
    "total_items": 3
  }
}
```

⚠️ HTTP Status Codes:
- `404` si la venta no existe

---

### <span style="color:green;">**GET**</span> `/api/sales/:id/products`
Obtiene únicamente los productos de una venta específica.

#### Response 🠮 `200 OK`
```json
{
  "success": true,
  "sale_id": 123,
  "products": [
    {
      "sale_id": 123,
      "product_id": 15,
      "quantity": 2,
      "unit_price": 800.00
    },
    {
      "sale_id": 123,
      "product_id": 23,
      "quantity": 1,
      "unit_price": 900.00
    }
  ],
  "total_items": 3
}
```

---

### <span style="color:green;">**GET**</span> `/api/sales/by-date/:date`
Obtiene ventas de una fecha específica (formato: YYYY-MM-DD).

#### Ejemplo: `/api/sales/by-date/2025-01-15`

#### Response 🠮 `200 OK`
```json
{
  "success": true,
  "date": "2025-01-15",
  "sales": [
    {
      "id": 123,
      "sale_date": "2025-01-15T10:30:00",
      "total_amount": 2500.00,
      "payment_method": "efectivo",
      "ticket_url": "",
      "invoice_state": "pendiente"
    }
  ],
  "total": 1
}
```

---

### <span style="color:green;">**GET**</span> `/api/sales/today`
Obtiene ventas de hoy junto con resumen del día.

#### Response 🠮 `200 OK`
```json
{
  "success": true,
  "date": "2025-01-15",
  "sales": [
    {
      "id": 123,
      "sale_date": "2025-01-15T10:30:00",
      "total_amount": 2500.00,
      "payment_method": "efectivo",
      "ticket_url": "",
      "invoice_state": "pendiente"
    }
  ],
  "summary": {
    "date": "2025-01-15",
    "total_sales": 3,
    "total_revenue": 7500.00,
    "average_sale": 2500.00
  }
}
```

---

### <span style="color:green;">**GET**</span> `/api/sales/summary`
Obtiene resumen de ventas del día actual o fecha específica.

#### Query Parameters (opcionales)
- `date`: Fecha específica en formato YYYY-MM-DD

#### Ejemplo: `/api/sales/summary?date=2025-01-15`

#### Response 🠮 `200 OK`
```json
{
  "success": true,
  "summary": {
    "date": "2025-01-15",
    "total_sales": 3,
    "total_revenue": 7500.00,
    "average_sale": 2500.00
  }
}
```

---

### <span style="color:orange;">**PUT**</span> `/api/sales/:id/status`
Actualiza el estado de facturación o URL del ticket de una venta.

#### Request Body
```json
{
  "invoice_state": "facturado",
  "ticket_url": "https://server/tickets/venta123.pdf"
}
```
**Nota:** Ambos campos son opcionales. Solo se actualizan los campos enviados.

#### Response 🠮 `200 OK`
```json
{
  "success": true,
  "message": "Venta actualizada correctamente",
  "sale": {
    "id": 123,
    "sale_date": "2025-01-15T10:30:00",
    "total_amount": 2500.00,
    "payment_method": "efectivo",
    "ticket_url": "https://server/tickets/venta123.pdf",
    "invoice_state": "facturado"
  }
}
```

⚠️ HTTP Status Codes:
- `404` si la venta no existe

---

### <span style="color:red;">**DELETE**</span> `/api/sales/:id`
Elimina una venta y restaura automáticamente el stock de los productos vendidos.

#### Response 🠮 `200 OK`
```json
{
  "success": true,
  "message": "Venta eliminada correctamente"
}
```

**Importante:** Esta operación:
- Restaura el stock de todos los productos vendidos
- Elimina la venta y sus productos asociados permanentemente
- Es una operación irreversible

⚠️ HTTP Status Codes:
- `404` si la venta no existe

---