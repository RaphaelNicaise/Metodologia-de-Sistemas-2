
    -- 2. Products
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
        name VARCHAR(255) NOT NULL,
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
        movement_type ENUM('ingreso','devolucion') NOT NULL,
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

