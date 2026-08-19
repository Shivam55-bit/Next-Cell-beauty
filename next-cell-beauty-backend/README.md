# NEXT CELL BEAUTY REST API Backend

Production-grade Node.js / Express.js / Prisma ORM / PostgreSQL backend powering the NEXT CELL BEAUTY ecommerce platform and admin panel.

## Features

- **JWT Authentication**: Role-based access control (Admin & Customer roles), password hashing with bcrypt, access & refresh token rotation.
- **18 Functional Domain Modules**: Products, Categories, Brands, Orders, Returns, Coupons, Customers, Reviews, Beauty Tutorials, Skin Quiz, Shade Finder, Banners, Blog CMS, FAQs, Policies, Settings, Analytics.
- **Database Transactions & Stock Safety**: Orders reduce product inventory safely using Prisma `$transaction` database locks.
- **OpenAPI / Swagger Documentation**: Interactive API testing available at `/api-docs`.
- **Health Check Endpoint**: Server and database connection status monitoring at `/healthz`.
- **File Uploads**: Multipart image uploading using Multer stored under `/uploads`.
- **Containerization**: Includes `Dockerfile` and `docker-compose.yml`.

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate Prisma Client & Initialize Database
```bash
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

### 3. Start Development Server
```bash
npm run dev
```

The API will be available at:
- Base API URL: `http://localhost:4000/api`
- Swagger UI Docs: `http://localhost:4000/api-docs`
- Health Check: `http://localhost:4000/healthz`

---

## Demo Admin Credentials

- **Email**: `admin@nextcall.com`
- **Password**: `admin123`

---

## Running Tests
```bash
npm test
```
