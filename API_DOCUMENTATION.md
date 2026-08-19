# Next Cell Beauty API Documentation

This document describes the backend API used by the Next Cell Beauty frontend and admin panel.

## Base URLs

- Local development: `http://localhost:4000/api`
- Swagger docs: `http://localhost:4000/api-docs`
- Health check: `http://localhost:4000/healthz`

## Authentication

Most admin endpoints require a bearer token.

### Admin login
- **POST** `/api/admin/auth/login`
- Request body:
  ```json
  {
    "email": "admin@example.com",
    "password": "password123"
  }
  ```
- Response includes an access token that should be sent as:
  ```http
  Authorization: Bearer <token>
  ```

### Get current admin profile
- **GET** `/api/admin/auth/me`

## Public Endpoints

### Products
- **GET** `/api/products` - Get all products
- **GET** `/api/products/:id` - Get a single product by ID

### Categories
- **GET** `/api/categories` - Get all categories

### Brands
- **GET** `/api/brands` - Get all brands

### Banners
- **GET** `/api/banners` - Get banners

### Blogs
- **GET** `/api/blogs` - Get blog posts
- **GET** `/api/blogs/:slug` - Get a blog by slug

### FAQs
- **GET** `/api/faqs` - Get frequently asked questions

### Policies
- **GET** `/api/policies` - Get policies
- **GET** `/api/policies/:type` - Get a policy by type

### Tutorials
- **GET** `/api/tutorials` - Get beauty tutorials

### Skin quiz
- **GET** `/api/skin-quiz` - Get skin quiz questions

### Shade finder
- **GET** `/api/shade-finder` - Get shade finder data

### Reviews
- **POST** `/api/reviews` - Submit a review

### Orders
- **POST** `/api/orders` - Create an order
- **GET** `/api/orders/:id` - Get an order by ID

## Admin Endpoints

### Products
- **GET** `/api/admin/products`
- **GET** `/api/admin/products/:id`
- **POST** `/api/admin/products`
- **PUT** `/api/admin/products/:id`
- **DELETE** `/api/admin/products/:id`

### Categories
- **GET** `/api/admin/categories`
- **POST** `/api/admin/categories`
- **PUT** `/api/admin/categories/:id`
- **DELETE** `/api/admin/categories/:id`

### Brands
- **GET** `/api/admin/brands`
- **POST** `/api/admin/brands`
- **PUT** `/api/admin/brands/:id`
- **DELETE** `/api/admin/brands/:id`

### Banners
- **GET** `/api/admin/banners`
- **GET** `/api/admin/banners/:id`
- **POST** `/api/admin/banners`
- **PUT** `/api/admin/banners/:id`
- **DELETE** `/api/admin/banners/:id`

### Blogs
- **GET** `/api/admin/blogs`
- **GET** `/api/admin/blogs/:id`
- **POST** `/api/admin/blogs`
- **PUT** `/api/admin/blogs/:id`
- **DELETE** `/api/admin/blogs/:id`

### FAQs
- **GET** `/api/admin/faqs`
- **POST** `/api/admin/faqs`
- **PUT** `/api/admin/faqs/:id`
- **DELETE** `/api/admin/faqs/:id`

### Policies
- **GET** `/api/admin/policies`
- **GET** `/api/admin/policies/:id`
- **PUT** `/api/admin/policies/:id`

### Tutorials
- **GET** `/api/admin/tutorials`
- **POST** `/api/admin/tutorials`
- **PUT** `/api/admin/tutorials/:id`
- **DELETE** `/api/admin/tutorials/:id`

### Skin quiz
- **GET** `/api/admin/skin-quiz`
- **POST** `/api/admin/skin-quiz`
- **PUT** `/api/admin/skin-quiz/:id`
- **DELETE** `/api/admin/skin-quiz/:id`

### Shade finder
- **GET** `/api/admin/shades`
- **POST** `/api/admin/shades`
- **PUT** `/api/admin/shades/:id`
- **DELETE** `/api/admin/shades/:id`

### Orders
- **GET** `/api/admin/orders`
- **GET** `/api/admin/orders/:id`
- **PUT** `/api/admin/orders/:id/status`
- **PUT** `/api/admin/orders/:id`

### Customers
- **GET** `/api/admin/customers`
- **GET** `/api/admin/customers/:id`
- **PUT** `/api/admin/customers/:id`
- **DELETE** `/api/admin/customers/:id`

### Reviews
- **GET** `/api/admin/reviews`
- **PUT** `/api/admin/reviews/:id/status`
- **PUT** `/api/admin/reviews/:id`
- **DELETE** `/api/admin/reviews/:id`

### Settings
- **GET** `/api/admin/settings`
- **PUT** `/api/admin/settings`

### Analytics
- **GET** `/api/admin/analytics/overview`
- **GET** `/api/admin/analytics/orders-summary`
- **GET** `/api/admin/analytics/revenue-by-day`
- **GET** `/api/admin/analytics/top-products`
- **GET** `/api/admin/analytics/top-categories`

### Uploads
- **POST** `/api/admin/upload`
- **POST** `/api/admin/products/upload`

## File Uploads

Uploaded files are served from:
- `http://localhost:4000/uploads/`

## Health Check

- **GET** `/healthz`
- Example response:
  ```json
  {
    "status": "ok",
    "database": "connected"
  }
  ```

## Example Requests

### Get all products
```bash
curl http://localhost:4000/api/products
```

### Admin login
```bash
curl -X POST http://localhost:4000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

### Health check
```bash
curl http://localhost:4000/healthz
```
