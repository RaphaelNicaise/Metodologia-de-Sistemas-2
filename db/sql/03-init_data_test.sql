CREATE DATABASE IF NOT EXISTS db_test;

USE db_test;

CREATE TABLE products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) UNIQUE NOT NULL,
        barcode VARCHAR(100) UNIQUE,
        price DECIMAL(10,2) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        url_image VARCHAR(255),
        category varchar(100)
); 

CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_barcode ON products(barcode);


-- 3. Sales
CREATE TABLE sales (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        total_amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50),
        ticket_url VARCHAR(255),  -- link to PDF in MinIO
        invoice_state ENUM('pendiente', 'facturado') DEFAULT 'pendiente'
);

CREATE INDEX idx_sales_date ON sales(sale_date);

-- 3.1 Sale ↔ Product
CREATE TABLE sale_product (
        sale_id INT,
        product_id INT,
        quantity INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL, -- price at sale time
        PRIMARY KEY (sale_id, product_id),
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX idx_sale_product_product_id ON sale_product(product_id);
CREATE INDEX idx_sale_product_sale_id ON sale_product(sale_id);

-- 4. Providers
CREATE TABLE providers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL UNIQUE,
        contact_email VARCHAR(255),
        phone_number VARCHAR(20),
        address TEXT,
        description TEXT
);

-- 4.1 Product ↔ Provider (many-to-many)
CREATE TABLE product_provider (
        product_id INT,
        provider_id INT,
        PRIMARY KEY (product_id, provider_id),
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
);

CREATE INDEX idx_product_provider_product_id ON product_provider(product_id);
CREATE INDEX idx_product_provider_provider_id ON product_provider(provider_id);

-- 5. Users
CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'empleado') DEFAULT 'empleado'
);

-- 6. Clients (for future invoicing with AFIP)
CREATE TABLE clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        tax_id VARCHAR(20),
        address VARCHAR(255),
        email VARCHAR(100),
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Expenses
CREATE TABLE expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        description VARCHAR(255) NOT NULL,
        category ENUM('proveedores', 'utilitarios', 'impuestos', 'salarios', 'alquiler','mantenimiento','otros') DEFAULT 'otros',
        amount DECIMAL(10,2) NOT NULL,
        expense_date DATE DEFAULT (CURRENT_DATE),
        user_id INT,
        notes TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 8. Cash Closures
CREATE TABLE cash_closures (
        id INT AUTO_INCREMENT PRIMARY KEY,
        closure_date DATE NOT NULL,
        user_id INT NOT NULL,
        total_sales DECIMAL(10,2) DEFAULT 0,
        total_expenses DECIMAL(10,2) DEFAULT 0,
        final_balance DECIMAL(10,2) DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 9. AFIP Invoices (future)
CREATE TABLE afip_invoices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sale_id INT NOT NULL,
        cae VARCHAR(50),
        cae_expiration DATE,
        invoice_type VARCHAR(5),
        invoice_number VARCHAR(20),
        FOREIGN KEY (sale_id) REFERENCES sales(id)
);

-- 10. Stock Movements
CREATE TABLE stock_movements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        movement_type ENUM('ingreso','salida','devolucion') NOT NULL,
        quantity INT NOT NULL,
        movement_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        user_id INT,            -- who registered the movement
        provider_id INT,        -- if the movement is related to a provider (e.g. purchase)
        notes TEXT,             -- optional comments
        
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE SET NULL
);

CREATE INDEX idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_date ON stock_movements(movement_date);

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