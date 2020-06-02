# ecommerce-backend-proto

REST API for an e-commerce application, built with Node.js, Express, and MongoDB.

## What it includes

- Node.js and Express REST API
- MongoDB persistence via Mongoose
- User registration and JWT-based authentication
- Role-based access control for customer, worker, and administrator flows
- Product, category, order, and shopping-cart data models
- Docker configuration for containerized execution

## Stack

- Node.js
- Express
- MongoDB / Mongoose
- JSON Web Tokens
- bcrypt
- Docker

## API areas

The API is organized under the following routes:

| Route | Purpose |
| --- | --- |
| `/api/users` | User registration, user management, and shopping-cart operations |
| `/api/login` | Authentication and token issuance |
| `/api/products` | Product catalogue management |
| `/api/categories` | Product categories |
| `/api/orders` | Order creation and fulfilment workflow |

Authenticated endpoints expect a bearer token:

```http
Authorization: Bearer <token>
```
