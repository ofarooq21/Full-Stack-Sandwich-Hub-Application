const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

// Create MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Lazer101Pro$$',
  database: process.env.NODE_ENV === 'test' ? 'sandwich_maker_test' : 'sandwich_maker',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Validation middleware
const validateSandwich = (req, res, next) => {
  const { name, description, price, image_url, rating, category, ingredients } = req.body;
  
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ message: 'Name is required and must be a string' });
  }
  
  if (price === undefined || isNaN(parseFloat(price))) {
    return res.status(400).json({ message: 'Valid price is required' });
  }
  
  if (ingredients && !Array.isArray(ingredients)) {
    return res.status(400).json({ message: 'Ingredients must be an array' });
  }
  
  next();
};

// Sandwiches endpoints
app.get('/api/sandwiches', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.*, GROUP_CONCAT(i.name) as ingredients
      FROM sandwiches s
      LEFT JOIN sandwich_ingredients si ON s.id = si.sandwich_id
      LEFT JOIN ingredients i ON si.ingredient_id = i.id
      GROUP BY s.id
    `);
    
    // Process the results
    const sandwiches = rows.map(sandwich => ({
      ...sandwich,
      ingredients: sandwich.ingredients ? sandwich.ingredients.split(',') : [],
      rating: parseFloat(sandwich.rating) || 0,
      price: parseFloat(sandwich.price) || 0
    }));
    
    res.json(sandwiches);
  } catch (error) {
    console.error('Error fetching sandwiches:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/sandwiches', validateSandwich, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { name, description, price, image_url, rating, category, ingredients } = req.body;
    
    // Insert sandwich
    const [result] = await connection.query(
      'INSERT INTO sandwiches (name, description, price, image_url, rating, category) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, price, image_url || null, rating || 0, category || null]
    );
    
    const sandwichId = result.insertId;
    
    // Handle ingredients if provided
    if (ingredients && ingredients.length > 0) {
      // First, ensure all ingredients exist
      const ingredientValues = ingredients.map(name => [name]);
      await connection.query(
        'INSERT IGNORE INTO ingredients (name) VALUES ?',
        [ingredientValues]
      );
      
      // Get ingredient IDs
      const [ingredientRows] = await connection.query(
        'SELECT id FROM ingredients WHERE name IN (?)',
        [ingredients]
      );
      
      // Create sandwich-ingredient relationships
      const sandwichIngredientValues = ingredientRows.map(row => [sandwichId, row.id]);
      await connection.query(
        'INSERT INTO sandwich_ingredients (sandwich_id, ingredient_id) VALUES ?',
        [sandwichIngredientValues]
      );
    }
    
    await connection.commit();
    
    // Fetch the complete sandwich data
    const [newSandwich] = await connection.query(`
      SELECT s.*, GROUP_CONCAT(i.name) as ingredients
      FROM sandwiches s
      LEFT JOIN sandwich_ingredients si ON s.id = si.sandwich_id
      LEFT JOIN ingredients i ON si.ingredient_id = i.id
      WHERE s.id = ?
      GROUP BY s.id
    `, [sandwichId]);
    
    if (newSandwich[0]) {
      newSandwich[0].ingredients = newSandwich[0].ingredients ? newSandwich[0].ingredients.split(',') : [];
      newSandwich[0].rating = parseFloat(newSandwich[0].rating) || 0;
      newSandwich[0].price = parseFloat(newSandwich[0].price) || 0;
    }
    
    res.status(201).json(newSandwich[0]);
  } catch (error) {
    await connection.rollback();
    console.error('Error creating sandwich:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    connection.release();
  }
});

app.put('/api/sandwiches/:id', validateSandwich, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const id = parseInt(req.params.id);
    const { name, description, price, image_url, rating, category, ingredients } = req.body;
    
    // Update sandwich
    await connection.query(
      'UPDATE sandwiches SET name = ?, description = ?, price = ?, image_url = ?, rating = ?, category = ? WHERE id = ?',
      [name, description, price, image_url || null, rating || 0, category || null, id]
    );
    
    // Handle ingredients
    if (ingredients) {
      // Remove existing ingredients
      await connection.query('DELETE FROM sandwich_ingredients WHERE sandwich_id = ?', [id]);
      
      if (ingredients.length > 0) {
        // Ensure all ingredients exist
        const ingredientValues = ingredients.map(name => [name]);
        await connection.query(
          'INSERT IGNORE INTO ingredients (name) VALUES ?',
          [ingredientValues]
        );
        
        // Get ingredient IDs
        const [ingredientRows] = await connection.query(
          'SELECT id FROM ingredients WHERE name IN (?)',
          [ingredients]
        );
        
        // Create new sandwich-ingredient relationships
        const sandwichIngredientValues = ingredientRows.map(row => [id, row.id]);
        await connection.query(
          'INSERT INTO sandwich_ingredients (sandwich_id, ingredient_id) VALUES ?',
          [sandwichIngredientValues]
        );
      }
    }
    
    await connection.commit();
    
    // Fetch the updated sandwich
    const [updatedSandwich] = await connection.query(`
      SELECT s.*, GROUP_CONCAT(i.name) as ingredients
      FROM sandwiches s
      LEFT JOIN sandwich_ingredients si ON s.id = si.sandwich_id
      LEFT JOIN ingredients i ON si.ingredient_id = i.id
      WHERE s.id = ?
      GROUP BY s.id
    `, [id]);
    
    if (updatedSandwich[0]) {
      updatedSandwich[0].ingredients = updatedSandwich[0].ingredients ? updatedSandwich[0].ingredients.split(',') : [];
      updatedSandwich[0].rating = parseFloat(updatedSandwich[0].rating) || 0;
      updatedSandwich[0].price = parseFloat(updatedSandwich[0].price) || 0;
    }
    
    res.json(updatedSandwich[0]);
  } catch (error) {
    await connection.rollback();
    console.error('Error updating sandwich:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    connection.release();
  }
});

app.delete('/api/sandwiches/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const id = parseInt(req.params.id);
    
    // Delete sandwich (cascade will handle sandwich_ingredients)
    await connection.query('DELETE FROM sandwiches WHERE id = ?', [id]);
    
    await connection.commit();
    res.status(204).send();
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting sandwich:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    connection.release();
  }
});

// Orders endpoints
app.get('/api/orders', async (req, res) => {
  try {
    const [orders] = await pool.query(`
      SELECT o.*, c.name as customer_name, c.email as customer_email,
      GROUP_CONCAT(
        JSON_OBJECT(
          'sandwichId', oi.sandwich_id,
          'sandwichName', s.name,
          'quantity', oi.quantity,
          'price', oi.price
        )
      ) as items
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN sandwiches s ON oi.sandwich_id = s.id
      GROUP BY o.id
    `);
    
    // Parse the items JSON string
    orders.forEach(order => {
      order.items = JSON.parse(`[${order.items}]`);
    });
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customerId, items, totalAmount } = req.body;
    
    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Create order
      const [orderResult] = await connection.query(
        'INSERT INTO orders (customer_id, total_amount) VALUES (?, ?)',
        [customerId, totalAmount]
      );
      
      const orderId = orderResult.insertId;
      
      // Add order items
      const itemValues = items.map(item => [
        orderId,
        item.sandwichId,
        item.quantity,
        item.price
      ]);
      
      await connection.query(
        'INSERT INTO order_items (order_id, sandwich_id, quantity, price) VALUES ?',
        [itemValues]
      );
      
      // Update customer stats
      await connection.query(
        'UPDATE customers SET order_count = order_count + 1, total_spent = total_spent + ?, last_order_date = NOW() WHERE id = ?',
        [totalAmount, customerId]
      );
      
      await connection.commit();
      
      const [newOrder] = await pool.query(`
        SELECT o.*, c.name as customer_name, c.email as customer_email,
        GROUP_CONCAT(
          JSON_OBJECT(
            'sandwichId', oi.sandwich_id,
            'sandwichName', s.name,
            'quantity', oi.quantity,
            'price', oi.price
          )
        ) as items
        FROM orders o
        LEFT JOIN customers c ON o.customer_id = c.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN sandwiches s ON oi.sandwich_id = s.id
        WHERE o.id = ?
        GROUP BY o.id
      `, [orderId]);
      
      newOrder[0].items = JSON.parse(`[${newOrder[0].items}]`);
      res.status(201).json(newOrder[0]);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { customerId, items, totalAmount } = req.body;
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Update order
      await connection.query(
        'UPDATE orders SET customer_id = ?, total_amount = ? WHERE id = ?',
        [customerId, totalAmount, id]
      );
      
      // Delete existing items
      await connection.query('DELETE FROM order_items WHERE order_id = ?', [id]);
      
      // Add new items
      const itemValues = items.map(item => [
        id,
        item.sandwichId,
        item.quantity,
        item.price
      ]);
      
      await connection.query(
        'INSERT INTO order_items (order_id, sandwich_id, quantity, price) VALUES ?',
        [itemValues]
      );
      
      await connection.commit();
      
      const [updatedOrder] = await pool.query(`
        SELECT o.*, c.name as customer_name, c.email as customer_email,
        GROUP_CONCAT(
          JSON_OBJECT(
            'sandwichId', oi.sandwich_id,
            'sandwichName', s.name,
            'quantity', oi.quantity,
            'price', oi.price
          )
        ) as items
        FROM orders o
        LEFT JOIN customers c ON o.customer_id = c.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN sandwiches s ON oi.sandwich_id = s.id
        WHERE o.id = ?
        GROUP BY o.id
      `, [id]);
      
      updatedOrder[0].items = JSON.parse(`[${updatedOrder[0].items}]`);
      res.json(updatedOrder[0]);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    
    const [updatedOrder] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    res.json(updatedOrder[0]);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await pool.query('DELETE FROM orders WHERE id = ?', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Customers endpoints
app.get('/api/customers', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM customers');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const [result] = await pool.query(
      'INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)',
      [name, email, phone, address]
    );
    
    const [newCustomer] = await pool.query('SELECT * FROM customers WHERE id = ?', [result.insertId]);
    res.status(201).json(newCustomer[0]);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/customers/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, email, phone, address } = req.body;
    
    await pool.query(
      'UPDATE customers SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?',
      [name, email, phone, address, id]
    );
    
    const [updatedCustomer] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);
    res.json(updatedCustomer[0]);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await pool.query('DELETE FROM customers WHERE id = ?', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reviews endpoints
app.get('/api/reviews', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.*, c.name as customer_name, s.name as sandwich_name
      FROM reviews r
      LEFT JOIN customers c ON r.customer_id = c.id
      LEFT JOIN sandwiches s ON r.sandwich_id = s.id
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { customerId, sandwichId, rating, comment } = req.body;
    const [result] = await pool.query(
      'INSERT INTO reviews (customer_id, sandwich_id, rating, comment) VALUES (?, ?, ?, ?)',
      [customerId, sandwichId, rating, comment]
    );
    
    const [newReview] = await pool.query(`
      SELECT r.*, c.name as customer_name, s.name as sandwich_name
      FROM reviews r
      LEFT JOIN customers c ON r.customer_id = c.id
      LEFT JOIN sandwiches s ON r.sandwich_id = s.id
      WHERE r.id = ?
    `, [result.insertId]);
    
    res.status(201).json(newReview[0]);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/reviews/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { customerId, sandwichId, rating, comment } = req.body;
    
    await pool.query(
      'UPDATE reviews SET customer_id = ?, sandwich_id = ?, rating = ?, comment = ? WHERE id = ?',
      [customerId, sandwichId, rating, comment, id]
    );
    
    const [updatedReview] = await pool.query(`
      SELECT r.*, c.name as customer_name, s.name as sandwich_name
      FROM reviews r
      LEFT JOIN customers c ON r.customer_id = c.id
      LEFT JOIN sandwiches s ON r.sandwich_id = s.id
      WHERE r.id = ?
    `, [id]);
    
    res.json(updatedReview[0]);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.patch('/api/reviews/:id/status', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    await pool.query('UPDATE reviews SET status = ? WHERE id = ?', [status, id]);
    
    const [updatedReview] = await pool.query(`
      SELECT r.*, c.name as customer_name, s.name as sandwich_name
      FROM reviews r
      LEFT JOIN customers c ON r.customer_id = c.id
      LEFT JOIN sandwiches s ON r.sandwich_id = s.id
      WHERE r.id = ?
    `, [id]);
    
    res.json(updatedReview[0]);
  } catch (error) {
    console.error('Error updating review status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/reviews/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await pool.query('DELETE FROM reviews WHERE id = ?', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Only start the server if this file is run directly
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

module.exports = app; 