-- Create the database
DROP DATABASE IF EXISTS sandwich_maker;
CREATE DATABASE sandwich_maker;
USE sandwich_maker;

-- Create tables
CREATE TABLE sandwiches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    rating DECIMAL(3,2),
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE ingredients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sandwich_ingredients (
    sandwich_id INT,
    ingredient_id INT,
    PRIMARY KEY (sandwich_id, ingredient_id),
    FOREIGN KEY (sandwich_id) REFERENCES sandwiches(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
);

CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    order_count INT DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    last_order_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'preparing', 'ready', 'delivered', 'cancelled') DEFAULT 'pending',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    sandwich_id INT,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (sandwich_id) REFERENCES sandwiches(id) ON DELETE SET NULL
);

CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    sandwich_id INT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (sandwich_id) REFERENCES sandwiches(id) ON DELETE SET NULL
);

-- Insert sample data
INSERT INTO sandwiches (name, description, price, image_url, rating, category) VALUES
('Classic Club', 'Triple-decker sandwich with turkey, bacon, lettuce, and tomato', 8.99, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af', 4.5, 'Classic'),
('Veggie Delight', 'Fresh vegetables with hummus and avocado', 7.99, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', 4.2, 'Vegetarian');

INSERT INTO ingredients (name) VALUES
('Turkey'), ('Bacon'), ('Lettuce'), ('Tomato'), ('Mayonnaise'),
('Cucumber'), ('Avocado'), ('Hummus');

INSERT INTO sandwich_ingredients (sandwich_id, ingredient_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5),
(2, 6), (2, 7), (2, 8), (2, 3), (2, 4);

INSERT INTO customers (name, email, phone, address, order_count, total_spent, last_order_date) VALUES
('John Doe', 'john@example.com', '555-0123', '123 Main St', 1, 17.98, '2024-03-20 10:00:00');

INSERT INTO orders (customer_id, total_amount, status, order_date) VALUES
(1, 17.98, 'pending', '2024-03-20 10:00:00');

INSERT INTO order_items (order_id, sandwich_id, quantity, price) VALUES
(1, 1, 2, 8.99);

INSERT INTO reviews (customer_id, sandwich_id, rating, comment, status) VALUES
(1, 1, 5, 'Great sandwich, very fresh ingredients!', 'approved'); 