const request = require('supertest');
const express = require('express');
const mysql = require('mysql2/promise');
const app = require('../server');

describe('API Endpoints', () => {
  let connection;
  let testDb = 'sandwich_maker_test';

  beforeAll(async () => {
    // Create test database connection
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Lazer101Pro$$',
    });

    // Create test database and tables
    await connection.query(`DROP DATABASE IF EXISTS ${testDb}`);
    await connection.query(`CREATE DATABASE ${testDb}`);
    await connection.query(`USE ${testDb}`);

    // Create test tables
    await connection.query(`
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
      )
    `);
  });

  afterAll(async () => {
    if (connection) {
      // Clean up test database
      await connection.query(`DROP DATABASE IF EXISTS ${testDb}`);
      await connection.end();
    }
  });

  describe('GET /api/sandwiches', () => {
    it('should return all sandwiches', async () => {
      const response = await request(app)
        .get('/api/sandwiches')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
    });
  });

  describe('POST /api/sandwiches', () => {
    it('should create a new sandwich', async () => {
      const newSandwich = {
        name: 'Test Sandwich',
        description: 'A test sandwich',
        price: 9.99,
        imageUrl: 'https://example.com/test.jpg',
        rating: 4.5,
        category: 'Test'
      };

      const response = await request(app)
        .post('/api/sandwiches')
        .send(newSandwich)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newSandwich.name);
      expect(parseFloat(response.body.price)).toBe(newSandwich.price);
    });
  });

  describe('PUT /api/sandwiches/:id', () => {
    it('should update an existing sandwich', async () => {
      // First create a sandwich
      const newSandwich = {
        name: 'Test Sandwich',
        description: 'A test sandwich',
        price: 9.99,
        imageUrl: 'https://example.com/test.jpg',
        rating: 4.5,
        category: 'Test'
      };

      const createResponse = await request(app)
        .post('/api/sandwiches')
        .send(newSandwich);

      const sandwichId = createResponse.body.id;

      // Then update it
      const updatedSandwich = {
        name: 'Updated Test Sandwich',
        description: 'An updated test sandwich',
        price: 10.99,
        imageUrl: 'https://example.com/updated.jpg',
        rating: 4.8,
        category: 'Updated'
      };

      const response = await request(app)
        .put(`/api/sandwiches/${sandwichId}`)
        .send(updatedSandwich)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.name).toBe(updatedSandwich.name);
      expect(parseFloat(response.body.price)).toBe(updatedSandwich.price);
    });
  });

  describe('DELETE /api/sandwiches/:id', () => {
    it('should delete an existing sandwich', async () => {
      // First create a sandwich
      const newSandwich = {
        name: 'Test Sandwich',
        description: 'A test sandwich',
        price: 9.99,
        imageUrl: 'https://example.com/test.jpg',
        rating: 4.5,
        category: 'Test'
      };

      const createResponse = await request(app)
        .post('/api/sandwiches')
        .send(newSandwich);

      const sandwichId = createResponse.body.id;

      // Then delete it
      await request(app)
        .delete(`/api/sandwiches/${sandwichId}`)
        .expect(204);

      // Verify it's deleted
      await request(app)
        .get(`/api/sandwiches/${sandwichId}`)
        .expect(404);
    });
  });
}); 