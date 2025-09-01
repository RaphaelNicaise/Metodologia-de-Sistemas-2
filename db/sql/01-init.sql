CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    barcode VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,   -- MySQL prefiere DECIMAL en vez de NUMERIC
    stock INTEGER NOT NULL DEFAULT 0,
    url_image VARCHAR(255)
);

CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_barcode ON products(barcode);


-- relacion muchos a muchos ya que 1 producto puede tener varias cat, y una cat varios productos
CREATE TABLE category_product (
    category_id INT,
    product_id INT,
    PRIMARY KEY (category_id, product_id),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX idx_category_product_product_id ON category_product(product_id);
CREATE INDEX idx_category_product_category_id ON category_product(category_id);


CREATE TABLE sales (
    sale_id INT AUTO_INCREMENT PRIMARY KEY,
    sale_date DATETIME NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    ticket_url VARCHAR(255)  -- link a PDF en MinIO
);

CREATE INDEX idx_sales_sale_date ON sales(sale_date);


CREATE TABLE sale_product (
    sale_id INT,
    product_id INT,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL, -- en el momento de la venta
    PRIMARY KEY (sale_id, product_id),
    FOREIGN KEY (sale_id) REFERENCES sales(sale_id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE INDEX idx_sale_product_product_id ON sale_product(product_id);
CREATE INDEX idx_sale_product_sale_id ON sale_product(sale_id);


CREATE TABLE providers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    phone_number VARCHAR(20),
    address TEXT,
    description TEXT
);


-- tabla intermedia para relacion muchos a muchos entre productos y proveedores
-- ya que un producto puede tener varios proveedores y un proveedor varios productos
CREATE TABLE product_provider (
    product_id INT,
    provider_id INT,
    PRIMARY KEY (product_id, provider_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
);
CREATE INDEX idx_product_provider_product_id ON product_provider(product_id);
CREATE INDEX idx_product_provider_provider_id ON product_provider(provider_id);