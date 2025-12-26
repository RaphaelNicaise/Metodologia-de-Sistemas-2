# Módulos del Sistema

## Módulo de Ventas (Caja)

Gestión del punto de venta con las siguientes funcionalidades:

- **Carrito de compras**: Agregar productos al carrito, modificar cantidades y confirmar venta.
- **Búsqueda de productos**: Por código de barras o nombre.
- **Métodos de pago**: Efectivo, tarjeta y otros.
- **Historial de ventas**: Consulta de ventas realizadas con filtros por fecha.
- **Detalle de venta**: Visualización completa de cada transacción con sus productos.

---

## Módulo de Productos

Administración completa del catálogo de productos:

- **CRUD de productos**: Crear, leer, actualizar y eliminar productos.
- **Campos**: Nombre, código de barras, precio de costo, precio de venta, proveedor, imagen.
- **Gestión de imágenes**: Carga de imágenes para cada producto.
- **Gestión de Stock**: Agregar stock, historial de movimientos de inventario.

---

## Módulo de Proveedores

Gestión de proveedores del negocio:

- **CRUD de proveedores**: Crear, leer, actualizar y eliminar.
- **Campos**: Nombre, descripción, teléfono, email, dirección.

---

## Módulo de Contabilidad

Control financiero del negocio:

- **Cierre de caja diario**: Registro de cierres con detalle de ventas y gastos del día.
- **Gestión de gastos**: CRUD de gastos con categorías.
- **Reportes**: Consulta de cierres por fecha.

---

## Dashboard

Panel de analíticas del negocio:

- **Estadísticas generales**: Ventas del día, productos más vendidos.
- **Gráficos**: Visualización de datos de ventas y gastos por categoría.

---

## Módulo de Configuración

Configuración general del sistema:

- **Datos del negocio**: Razón social, dirección, teléfono.

---

## Módulos Transversales

Componentes de soporte utilizados por otros módulos:

- **Scanning**: Lectura de códigos de barras.
- **MinIO Storage**: Almacenamiento de archivos e imágenes.