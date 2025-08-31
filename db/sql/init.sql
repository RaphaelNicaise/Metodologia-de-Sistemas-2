CREATE TABLE products (
    id INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    barcode VARCHAR(100),
    price NUMERIC(10,2) NOT NULL,
    stock INTEGER NOT NULL,
    category VARCHAR(100)
)