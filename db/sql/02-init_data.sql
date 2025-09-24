USE db;

-- Proveedores
INSERT INTO providers (name, contact_email, phone_number, address, description) VALUES
('Proveedor Uno', 'contacto1@proveedor.com', '123456789', 'Calle Falsa 123, Ciudad', 'Proveedor de productos electrónicos'),
('Proveedor Dos', 'contacto2@proveedor.com', '987654321', 'Avenida Siempre Viva 742, Ciudad', 'Proveedor de alimentos y bebidas'),
('Proveedor Tres', 'contacto3@proveedor.com', '555123456', 'Boulevard Central 456, Ciudad', 'Proveedor de artículos de oficina');

-- Productos
INSERT INTO products (name, price, stock, barcode, url_image, category) VALUES
('Producto A', 19.99, 100, '253457892345', NULL, 'Alimentos'),
('Producto B', 29.99, 200, '724385270352', NULL, 'Electronicas'),
('Producto C', 19.99, 150, '389543207459', NULL, 'Bebidas');

-- Usuario admin
INSERT INTO users (name, email, password, role) VALUES
('admin', 'admin@gmail.com', 'hashed_password_1', 'admin');

-- Ventas de prueba (para reportes)
INSERT INTO sales (total_amount, payment_method, invoice_state, sale_date) VALUES 
(59.97, 'efectivo', 'pendiente', CURDATE()),                    -- 3 Producto A hoy
(89.97, 'tarjeta', 'pendiente', CURDATE()),                     -- 3 Producto B hoy  
(39.98, 'efectivo', 'facturado', DATE_SUB(CURDATE(), INTERVAL 1 DAY)),  -- 2 Producto A ayer
(49.97, 'tarjeta', 'pendiente', DATE_SUB(CURDATE(), INTERVAL 1 DAY));   -- Producto B + C ayer

-- Gastos de prueba (algunos de caja, otros no)
INSERT INTO expenses (description, category, amount, expense_date, user_id, notes) VALUES 
('Pago proveedor en efectivo', 'proveedores', 2000.00, CURDATE(), 1, 'CAJA - Pago directo'),
('Servicios públicos', 'utilitarios', 500.00, CURDATE(), 1, 'Transferencia bancaria'),
('Compra mercadería', 'proveedores', 1500.00, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 1, 'EFECTIVO - Compra directa'),
('Alquiler local', 'alquiler', 8000.00, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 1, 'Débito automático'),
('Mantenimiento equipos', 'mantenimiento', 300.00, CURDATE(), 1, 'CAJA - Reparación inmediata'),
('Salario empleado', 'salarios', 25000.00, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 1, 'Transferencia bancaria');

-- Relación producto-venta (para que los reportes tengan productos)
INSERT INTO sale_product (sale_id, product_id, quantity, unit_price) VALUES
-- Venta 1: 3 Producto A
(1, 1, 3, 19.99),
-- Venta 2: 3 Producto B  
(2, 2, 3, 29.99),
-- Venta 3: 2 Producto A
(3, 1, 2, 19.99),
-- Venta 4: 1 Producto B + 1 Producto C
(4, 2, 1, 29.99),
(4, 3, 1, 19.99);