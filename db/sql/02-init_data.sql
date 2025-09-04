INSERT INTO providers (name, contact_email, phone_number, address, description) VALUES
('Proveedor Uno', 'contacto1@proveedor.com', '123456789', 'Calle Falsa 123, Ciudad', 'Proveedor de productos electrónicos'),
('Proveedor Dos', 'contacto2@proveedor.com', '987654321', 'Avenida Siempre Viva 742, Ciudad', 'Proveedor de alimentos y bebidas'),
('Proveedor Tres', 'contacto3@proveedor.com', '555123456', 'Boulevard Central 456, Ciudad', 'Proveedor de artículos de oficina');

INSERT INTO products (name, price, stock, barcode, url_image, category) VALUES
('Producto A', 19.99, 100, 253457892345, NULL, 'Alimentos'),
('Producto B', 29.99, 200, 724385270352, NULL, 'Electronicas'),
('Producto C', 19.99, 150, 389543207459, NULL, 'Bebidas');


INSERT INTO users (name, email, password, role) VALUES
('admin', 'admin@gmail.com', 'hashed_password_1', 'admin');