Sistema de Gestión Comercial para Kioscos y Supermercados

## Api Docs -> [Ver aca](doc_api.md)
## Instalación y Configuración  [Ver aca](doc_tecnica.md)

# Stack tecnológico
Flask, React, Node.js, Docker, MongoDB, MySQL, Git, Typescript. 

# Módulo de Venta (Caja)

### Carrito de compras:

- Escaneo con cámara (lector de código de barras). (MVP)
- Escaneo con lector de código de barras USB. (Fase 2)

- Historial de escaneos para evitar falsos positivos.

- Ingreso manual por:
    - Código de barras.

    - Nombre del producto.

    - Proveedor.

### Gestión de tickets:

Subtotal, IVA, descuentos, total.

Impresión de ticket.
- Datos:
    - Ticket ID → Identificador único del ticket (clave principal en la base de datos), que se crea al crear el ticket.

    - Fecha y hora → Para registro y orden de tickets.

    - Razón social / Nombre del comercio → Para identificar el kiosco/empresa.

    - Productos → Lista de productos comprados.

    - Cantidad → Cantidad de cada producto.

    - Precio unitario → Precio de cada producto.

    - Subtotal por producto → Cantidad × Precio unitario.

    - Total final → Suma de todos los subtotales.

    - Código de barras (1D) → Contiene solo el ticket_id para búsquedas internas.

    - IVA. (10%)

    - Opcional: método de pago, notas, datos fiscales (CUIT, domicilio, etc.).

Opción de anular productos antes de confirmar.

### Medios de pago:

Efectivo, tarjeta, QR, billeteras virtuales.

### Historial de ventas:

Registro diario con filtros.

# Modulo de productos
Gestion de Productos: Crud
- Escaneo con lector de código de barras USB. 
- Ingreso manual por:
    - Código de barras.

    - Nombre del producto.

    - Proveedor.

Gestion de Stock: ingresos
Historial de movimientos
Agregar stock

# Modulo de proveedores
CRUD
Nombre
Descripcion
Numero
Mail
Direccion

# Modulo de contabilidad
Resumen cierre de caja, semanal y mensual, 

# Modulo de usuarios y roles

2 usuarios:
    gestor de negocio:
        superusuario
    vendedor:
        tiene acceso limitado a ciertas funcionalidades de la contabilidad, por ejemplo solo podria hacer los cierres de caja


# Dashboard
Analiticas del negocio

# Configuración
El admin del negocio va a poder crear usuarios vendedores.
Tema oscuro y claro (a definir)

# Modulos transversales -> tickets, scanning, minio_storage