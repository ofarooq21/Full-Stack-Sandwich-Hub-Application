# Sandwich Hub Application

A full-stack web application for managing a sandwich shop, built with React, Node.js, and MySQL.

## Features

### Restaurant Staff Features
1. View and manage sandwich menu
2. Track orders and their status
3. Manage customer information
4. View and moderate customer reviews
5. Track popular items and sales
6. Manage inventory and ingredients
7. Generate reports and analytics
8. Handle special requests and customizations

### Customer Features
1. Browse sandwich menu
2. Place orders online
3. Track order status
4. View order history
5. Leave reviews and ratings
6. Save favorite orders
7. Customize sandwich ingredients

## Tech Stack

### Frontend
- React
- Material-UI
- React Router
- Axios

### Backend
- Node.js
- Express
- MySQL
- Jest (Testing)

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd sandwich-maker
```

2. Set up the database:
```bash
cd backend
mysql -u root -p < db/schema.sql
```

3. Install backend dependencies:
```bash
cd backend
npm install
```

4. Install frontend dependencies:
```bash
cd frontend
npm install
```

5. Start the backend server:
```bash
cd backend
npm run dev
```

6. Start the frontend development server:
```bash
cd frontend
npm run dev
```

7. Run tests:
```bash
cd backend
npm test
```

## API Endpoints

### Sandwiches
- GET /api/sandwiches - Get all sandwiches
- POST /api/sandwiches - Create a new sandwich
- PUT /api/sandwiches/:id - Update a sandwich
- DELETE /api/sandwiches/:id - Delete a sandwich

### Orders
- GET /api/orders - Get all orders
- POST /api/orders - Create a new order
- PUT /api/orders/:id - Update an order
- PATCH /api/orders/:id/status - Update order status
- DELETE /api/orders/:id - Delete an order

### Customers
- GET /api/customers - Get all customers
- POST /api/customers - Create a new customer
- PUT /api/customers/:id - Update a customer
- DELETE /api/customers/:id - Delete a customer

### Reviews
- GET /api/reviews - Get all reviews
- POST /api/reviews - Create a new review
- PUT /api/reviews/:id - Update a review
- PATCH /api/reviews/:id/status - Update review status
- DELETE /api/reviews/:id - Delete a review

## Database Schema

The application uses a MySQL database with the following tables:
- sandwiches
- ingredients
- sandwich_ingredients
- customers
- orders
- order_items
- reviews

## Testing

The application includes unit tests for the API endpoints using Jest and Supertest. Run the tests with:
```bash
cd backend
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 
