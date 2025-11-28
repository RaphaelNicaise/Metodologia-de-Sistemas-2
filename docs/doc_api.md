## Documentacion de API

[Productos](#productos) | [Ventas](#ventas) | [Proveedores](#providers) | [Cierres de Caja](#cash-closures) | [Gastos](#expenses)


### Productos

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

### Ventas

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

### Providers




### Cash Closures

| Método                                    | Endpoint                                          | Descripción                                              | 

Documentación                                                    |
| ----------------------------------------- | ------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------- |
| <span style="color:green;">**GET**</span> | `/api/contabilidad/cash_closures`                 | Obtiene el historial completo de cierres de caja.        | [Ver detalles](#get-apicontabilidadcash_closures)                |
| <span style="color:green;">**GET**</span> | `/api/contabilidad/cash_closures/:id`             | Obtiene un cierre de caja por ID con todos sus detalles. | [Ver detalles](#get-apicontabilidadcash_closuresid)              |
| <span style="color:blue;">**POST**</span> | `/api/contabilidad/cash_closures/close_day`       | Crea el cierre de caja de una fecha específica.          | [Ver detalles](#post-apicontabilidadcash_closuresclose_day)      |
| <span style="color:green;">**GET**</span> | `/api/contabilidad/cash_closures/preview/:date`   | Previsualiza un cierre sin crearlo.                      | [Ver detalles](#get-apicontabilidadcash_closurespreviewdate)     |
| <span style="color:green;">**GET**</span> | `/api/contabilidad/cash_closures/date/:date`      | Obtiene un cierre por fecha exacta.                      | [Ver detalles](#get-apicontabilidadcash_closuresdatedate)        |
| <span style="color:green;">**GET**</span> | `/api/contabilidad/cash_closures/monthly-summary` | Obtiene estadísticas mensuales de caja.                  | [Ver detalles](#get-apicontabilidadcash_closuresmonthly-summary) |


# 🟩 GET `/api/contabilidad/cash_closures`

Obtiene el historial completo de cierres de caja.

### Response 🠮 `200 OK`

``` json
[
  {
    "closure_date": "Tue, 25 Nov 2025 00:00:00 GMT",
    "final_balance": "0.00",
    "id": 3,
    "total_expenses": "0.00",
    "total_sales": "0.00",
    "user_id": 1,
    "user_name": "admin"
  }
]
```

------------------------------------------------------------------------

# 🟩 GET `/api/contabilidad/cash_closures/:id`

Obtiene un cierre de caja con todos sus detalles.

### Response 🠮 `200 OK`

``` json
{
  "id": 1,
  "closure_date": "Wed, 12 Nov 2025 00:00:00 GMT",
  "user_id": 1,
  "cash_expenses": 2300.0,
  "total_expenses": "2300.00",
  "total_sales": "149.94",
  "final_balance": "-2150.06",
  "pending_invoices": 3,
  "low_stock_products": 0,
  "other_expenses": 0.0,
  "sales_breakdown": {
    "efectivo": 59.97,
    "tarjeta": 89.97
  },
  "expenses_breakdown": {
    "impuestos": 9000.0,
    "mantenimiento": 300.0,
    "proveedores": 2000.0
  }
}
```

------------------------------------------------------------------------

# 🔵 POST `/api/contabilidad/cash_closures/close_day`

Crea un cierre de caja para una fecha específica.

### Request Body

``` json
{
  "closure_date": "2025-11-12",
  "user_id": 1
}
```

### Response 🠮 `201 Created`

``` json
{
  "success": true,
  "message": "Cierre de caja creado correctamente",
  "closure": {
    "id": 4,
    "closure_date": "2025-11-12",
    "user_id": 1,
    "cash_expenses": 2300.0,
    "total_expenses": "2300.00",
    "total_sales": "149.94",
    "final_balance": "-2150.06",
    "pending_invoices": 3,
    "low_stock_products": 0,
    "other_expenses": 0.0,
    "sales_breakdown": {
      "efectivo": 59.97,
      "tarjeta": 89.97
    },
    "expenses_breakdown": {
      "impuestos": 9000.0,
      "mantenimiento": 300.0,
      "proveedores": 2000.0
    }
  }
}
```

### ❗Errores

-   `400` → falta de datos, formato inválido o ya existe cierre para esa fecha\
-   `403` → usuario sin permisos\
-   `500` → error interno del servidor

------------------------------------------------------------------------

# 🟩 GET `/api/contabilidad/cash_closures/preview/:date`

Previsualiza un cierre **sin crearlo**.

### Response 🠮 `200 OK`

``` json
{
  "closure_date": "2025-11-12",
  "can_close": true,
  "cash_expenses": 2300.0,
  "total_expenses": "2300.00",
  "total_sales": "149.94",
  "final_balance": "-2150.06",
  "pending_invoices": 3,
  "low_stock_products": 0,
  "other_expenses": 0.0,
  "sales_breakdown": {
    "efectivo": 59.97,
    "tarjeta": 89.97
  },
  "expenses_breakdown": {
    "impuestos": 9000.0,
    "mantenimiento": 300.0,
    "proveedores": 2000.0
  }
}
```

### ❗Errores

-   `400` → formato de fecha inválido\
-   `400` → ya existe un cierre para esa fecha

------------------------------------------------------------------------

# 🟩 GET `/api/contabilidad/cash_closures/date/:date`

Obtiene un cierre por fecha específica.

### Response 🠮 `200 OK`

``` json
{
  "id": 1,
  "closure_date": "Wed, 12 Nov 2025 00:00:00 GMT",
  "user_id": 1,
  "cash_expenses": 2300.0,
  "total_expenses": "2300.00",
  "total_sales": "149.94",
  "final_balance": "-2150.06",
  "pending_invoices": 3,
  "low_stock_products": 0,
  "other_expenses": 0.0,
  "sales_breakdown": {
    "efectivo": 59.97,
    "tarjeta": 89.97
  },
  "expenses_breakdown": {
    "impuestos": 9000.0,
    "mantenimiento": 300.0,
    "proveedores": 2000.0
  }
}
```

------------------------------------------------------------------------

# 🟩 GET `/api/contabilidad/cash_closures/monthly-summary`

Obtiene estadísticas del mes.

### Response 🠮 `200 OK`

``` json
{
  "avg_daily_balance": "-84050.020000",
  "monthly_balance": "-252150.06",
  "monthly_expenses": "252300.00",
  "monthly_sales": "149.94",
  "total_closures": 3
}
```

------------------------------------------------------------------------


# Expenses – API Documentation

## Endpoints

| Método                                      | Endpoint      | Descripción                                                    | Documentación Específica |
| <span style="color:blue;">**POST**</span> | `/api/expenses` | Crea un gasto.                                                | [Ver detalles](#post-apiexpenses) |
| <span style="color:green;">**GET**</span> | `/api/expenses` | Obtiene todos los gastos.                                     | [Ver detalles](#get-apiexpenses) |
| <span style="color:green;">**GET**</span> | `/api/expenses/:id` | Obtiene un gasto específico.                              | [Ver detalles](#get-apiexpensesid) |
| <span style="color:orange;">**PUT**</span> | `/api/expenses/:id` | Actualiza un gasto.                                      | [Ver detalles](#put-apiexpensesid) |
| <span style="color:red;">**DELETE**</span> | `/api/expenses/:id` | Elimina un gasto.                                        | [Ver detalles](#delete-apiexpensesid) |
| <span style="color:green;">**GET**</span> | `/api/expenses/by-category/:category` | Obtiene gastos filtrados por categoría. | [Ver detalles](#get-apiexpensesbycategory) |
| <span style="color:green;">**GET**</span> | `/api/expenses/by-month/:month` | Obtiene total de gastos por mes.              | [Ver detalles](#get-apiexpensesbymonth) |



------------------------------------------------------------------------

# <span style="color:blue;">**POST**</span> `/api/expenses`

Crea un gasto.

### Request Body
```json
{
  "description": "Compra de insumos limpieza",
  "category": "mantenimiento",
  "amount": 4500.50,
  "expense_date": "2025-01-20",
  "user_id": 1,
  "notes": "EFECTIVO - Compra en el chino"
}
```

### Response 🠮 `201 Created`
```json
{
    "amount": "4500.50",
    "category": "mantenimiento",
    "description": "Compra de insumos limpieza",
    "expense_date": "Mon, 20 Jan 2025 00:00:00 GMT",
    "id": 23,
    "notes": "EFECTIVO - Compra en el chino",
    "user_id": 1
}
```

### ❗Errores
- `400` → datos faltantes o inválidos  
- `500` → error interno del servidor


------------------------------------------------------------------------

# <span style="color:green;">**GET**</span> `/api/expenses`

Obtiene todos los gastos registrados.

### Response 🠮 `200 OK`
```json
[
    {
        "amount": "250000.00",
        "category": "salarios",
        "description": "empleado",
        "expense_date": "Sun, 16 Nov 2025 00:00:00 GMT",
        "id": 14,
        "notes": "CAJA",
        "user_id": 1
    },
    {
        "amount": "300000.00",
        "category": "proveedores",
        "description": "coca cola",
        "expense_date": "Sun, 16 Nov 2025 00:00:00 GMT",
        "id": 15,
        "notes": "",
        "user_id": 1
    },
    {
        "amount": "70000.00",
        "category": "impuestos",
        "description": "Pago Gas",
        "expense_date": "Sun, 16 Nov 2025 00:00:00 GMT",
        "id": 16,
        "notes": "",
        "user_id": 1
    }
]
```


------------------------------------------------------------------------

# <span style="color:green;">**GET**</span> `/api/expenses/:id`

### Response 🠮 `200 OK`
```json
{
    "amount": "2000.00",
    "category": "proveedores",
    "description": "Pago proveedor en efectivo",
    "expense_date": "Wed, 12 Nov 2025 00:00:00 GMT",
    "id": 1,
    "notes": "CAJA - Pago directo",
    "user_id": 1
}
```

### ❗Errores
- `404` → gasto no encontrado  
- `500` → error interno del servidor


------------------------------------------------------------------------

# <span style="color:orange;">**PUT**</span> `/api/expenses/:id`

Actualiza un gasto.

### Request Body
```json
{
  "description": "Compra de insumos limpieza (Corregido)",
  "category": "mantenimiento",
  "amount": 4800.50,
  "expense_date": "2025-01-20",
  "user_id": 1,
  "notes": "EFECTIVO - Compra en el chino"
}
```

### Response 🠮 `200 OK`
```json
{
    "amount": "4800.50",
    "category": "mantenimiento",
    "description": "Compra de insumos limpieza (Corregido)",
    "expense_date": "Mon, 20 Jan 2025 00:00:00 GMT",
    "id": 23,
    "notes": "EFECTIVO - Compra en el chino",
    "user_id": 1
}
```

------------------------------------------------------------------------

# <span style="color:red;">**DELETE**</span> `/api/expenses/:id`

### Response 🠮 `200 OK`
```json
{
    "message": "Expense deleted successfully"
}
```

### ❗Errores
- `404` → gasto no encontrado  
- `500` → error interno del servidor


------------------------------------------------------------------------

# <span style="color:green;">**GET**</span> `/api/expenses/by-category/:category`

### Response 🠮 `200 OK`
```json
[
    {
        "amount": "300000.00",
        "category": "proveedores",
        "description": "coca cola",
        "expense_date": "Sun, 16 Nov 2025 00:00:00 GMT",
        "id": 15,
        "notes": "",
        "user_id": 1
    },
    {
        "amount": "1500.00",
        "category": "proveedores",
        "description": "coca cola",
        "expense_date": "Sun, 16 Nov 2025 00:00:00 GMT",
        "id": 17,
        "notes": "",
        "user_id": 1
    }
]
```


------------------------------------------------------------------------

# <span style="color:green;">**GET**</span> `/api/expenses/by-month/:month`

### Response 🠮 `200 OK`
```json
[
    {
        "month": 11,
        "total_amount": "44176285.00"
    }
]

```

------------------------------------------------------------------------

# Reports -- API Documentation

## Endpoints


| Método                                    | Endpoint                         Descripción                                                                                         | Documentación Específica |
|        |                                                                                                                                                                    |
| <span style="color:green;">**GET**</span> | `/api/contabilidad/reports/dashboard` | Obtiene el resumen general del dashboard (KPIs, Alertas).   | [Ver detalles](#get-dashboard) |
| <span style="color:green;">**GET**</span> | `/api/contabilidad/reports/daily` | Obtiene el reporte diario detallado.                            | [Ver detalles](#get-daily) |
| <span style="color:green;">**GET**</span> | `/api/contabilidad/reports/monthly` | Obtiene el reporte mensual con cierres y desglose.            | [Ver detalles](#get-monthly) |
| <span style="color:green;">**GET**</span> | `/api/contabilidad/reports/quick-stats/week` | Obtiene estadísticas rápidas de la semana actual.    | [Ver detalles](#get-week) |
| <span style="color:green;">**GET**</span> | `/api/contabilidad/reports/comparison` | Compara métricas entre el periodo actual y el anterior.    | [Ver detalles](#get-comparison) |

------------------------------------------------------------------------

# GET `/api/contabilidad/reports/dashboard`

Obtiene la información general del dashboard.

### Response `200 OK`

``` json
{
    "alerts": {
        "low_stock_products": 0,
        "pending_invoices": {
            "amount": 199.91,
            "count": 3
        }
    },
    "generated_at": "2025-11-25T19:44:32.292750",
    "this_month": {
        "growth_percent": 0,
        "sales_amount": 239.89,
        "sales_count": 4
    },
    "today": {
        "growth_percent": 0,
        "sales_amount": 0.0,
        "sales_count": 0
    },
    "top_products_month": [
        { "name": "Producto A", "total_sold": "5" },
        { "name": "Producto B", "total_sold": "4" },
        { "name": "Producto C", "total_sold": "1" }
    ]
}
```

------------------------------------------------------------------------

# GET `/api/contabilidad/reports/daily?date=YYYY-MM-DD`

Obtiene un reporte diario completo.

### Response `200 OK`

``` json
{
    "cash_balance": -2150.06,
    "date": "2025-11-12",
    "expenses": {
        "by_category": [
            { "category": "impuestos", "total": "9000.00" },
            { "category": "proveedores", "total": "2000.00" },
            { "category": "mantenimiento", "total": "300.00" }
        ],
        "cash_expenses": 2300.0,
        "other_expenses": 0.0
    },
    "pending_invoices": {
        "count": 3,
        "total_amount": 199.91
    },
    "sales": {
        "by_payment_method": [
            { "amount_by_method": "59.97", "payment_method": "efectivo", "total_amount": "59.97", "total_sales": 1 },
            { "amount_by_method": "89.97", "payment_method": "tarjeta", "total_amount": "89.97", "total_sales": 1 }
        ],
        "total_amount": 149.94,
        "total_count": 2
    },
    "stock_movements": [],
    "top_products": [
        { "name": "Producto A", "total_revenue": "59.97", "total_sold": "3" },
        { "name": "Producto B", "total_revenue": "89.97", "total_sold": "3" }
    ]
}
```

------------------------------------------------------------------------

# GET `/api/contabilidad/reports/monthly?year=YYYY&month=MM`

Obtiene un reporte mensual completo.

### Response `200 OK`

``` json
{
    "cash_closures": [
        { "closure_date": "Wed, 12 Nov 2025 00:00:00 GMT", "final_balance": "-2150.06", "total_expenses": "2300.00", "total_sales": "149.94" },
        { "closure_date": "Sun, 16 Nov 2025 00:00:00 GMT", "final_balance": "-250000.00", "total_expenses": "250000.00", "total_sales": "0.00" },
        { "closure_date": "Tue, 25 Nov 2025 00:00:00 GMT", "final_balance": "0.00", "total_expenses": "0.00", "total_sales": "0.00" }
    ],
    "daily_breakdown": [
        { "date": "Tue, 11 Nov 2025 00:00:00 GMT", "sales_count": 2, "total_amount": "89.95" },
        { "date": "Wed, 12 Nov 2025 00:00:00 GMT", "sales_count": 2, "total_amount": "149.94" }
    ],
    "expenses_by_category": [
        { "category": "utilitarios", "total": "43485532.00" },
        { "category": "proveedores", "total": "323500.00" },
        { "category": "salarios", "total": "278453.00" },
        { "category": "impuestos", "total": "79000.00" },
        { "category": "alquiler", "total": "8000.00" },
        { "category": "otros", "total": "1500.00" },
        { "category": "mantenimiento", "total": "300.00" }
    ],
    "period": "2025-11",
    "summary": {
        "revenue_growth_percent": 0,
        "total_revenue": 239.89,
        "total_sales": 4
    },
    "top_products": [
        { "name": "Producto A", "total_revenue": "99.95", "total_sold": "5" },
        { "name": "Producto B", "total_revenue": "119.96", "total_sold": "4" },
        { "name": "Producto C", "total_revenue": "19.99", "total_sold": "1" }
    ]
}
```

------------------------------------------------------------------------

# GET `/api/contabilidad/reports/quick-stats/week`

Obtiene estadísticas rápidas de la semana.

### Response `200 OK`

``` json
{
    "daily_breakdown": [],
    "total_amount": 0.0,
    "total_sales": 0,
    "week_end": "2025-11-25",
    "week_start": "2025-11-24"
}
```

------------------------------------------------------------------------

# GET `/api/contabilidad/reports/comparison?type=monthly`

Compara períodos actuales y anteriores.

### Response `200 OK`

``` json
{
    "current": {
        "data": { "revenue_growth_percent": 0, "total_revenue": 239.89, "total_sales": 4 },
        "period": "2025-11"
    },
    "previous": {
        "data": { "revenue_growth_percent": 0, "total_revenue": 0.0, "total_sales": 0 },
        "period": "2025-10"
    },
    "type": "monthly"
}
```
