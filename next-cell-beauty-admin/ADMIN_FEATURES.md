# NEXT CELL BEAUTY Admin Features

This document describes the admin dashboard sections, navigation items, and the current implementation status for each feature.

## Overview

The admin panel is designed to manage the beauty store from one workspace. It includes:

- Dashboard overview and store status
- Catalog management
- Sales operations
- Customer management
- Beauty content tools
- Website CMS controls
- System settings

---

## Authentication & Admin Login

### Login Flow

The admin panel uses token-based authentication to secure access. Here's how the login system works:

#### Login Page (`/login`)
- **Route**: `/login`
- **Component**: `LoginPage` (`src/pages/auth/LoginPage.jsx`)
- **Description**: Public login page where admins enter their credentials

#### Login Credentials Required
- **Email**: Admin email address (validated as valid email format)
- **Password**: Admin account password

#### Login Process
1. Admin navigates to `/login` page
2. Enters valid email and password
3. Form validates inputs:
   - Email must be in valid email format
   - Password must not be empty
4. On form submission, sends POST request to: `{API_BASE_URL}/api/admin/auth/login`
5. Backend validates credentials and returns:
   - `accessToken` - JWT token for authenticated requests
   - `refreshToken` (optional) - Token for refreshing access
   - `admin` - Admin user object with name and email

#### Token Storage
After successful login, tokens and user info are stored in browser's `localStorage`:
- **`adminToken`**: Access token used for API authentication (required)
- **`adminRefreshToken`**: Refresh token for token renewal (optional)
- **`adminUser`**: JSON string containing admin user data { name, email }

#### Protected Routes
All dashboard routes (except `/login`) are protected by the `ProtectedRoute` component:
- **Location**: `src/components/ProtectedRoute.jsx`
- **Protection Logic**: Checks for `adminToken` in localStorage
- **If Token Missing**: Automatically redirects to `/login`
- **If Token Present**: Allows access to dashboard and all admin features

#### Logout
To logout, remove tokens from localStorage:
```javascript
localStorage.removeItem("adminToken");
localStorage.removeItem("adminRefreshToken");
localStorage.removeItem("adminUser");
// Then redirect to /login
```

#### Example Login Credentials Format
```json
{
  "email": "admin@nextcellbeauty.com",
  "password": "your_secure_password"
}
```

#### API Endpoint
- **Method**: POST
- **URL**: `/api/admin/auth/login`
- **Full URL**: `http://localhost:4001/api/admin/auth/login`
- **Request Body**: `{ email: string, password: string }`
- **Success Response**: `{ accessToken: string, refreshToken?: string, admin: { name: string, email: string } }`
- **Error Response**: `{ message: string }` (e.g., "Invalid email or password")

#### Security Features
- Password input field has show/hide toggle
- Form validates email format before submission
- Tokens stored securely in localStorage
- Protected routes automatically redirect unauthenticated users
- Failed login attempts display user-friendly error messages

---

### Testing Admin Login with Postman / cURL

Use these commands to test the admin login API in Postman or terminal.

#### Environment Setup
Before testing, replace these placeholders:
- `{API_BASE_URL}` - e.g., `http://localhost:4001`
- `{ADMIN_EMAIL}` - Your admin email address
- `{ADMIN_PASSWORD}` - Your admin password

#### cURL Command - Successful Login

```bash
curl -X POST http://localhost:4001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@nextcellbeauty.com",
    "password": "admin123"
  }'
```

#### cURL Command - Windows PowerShell

```powershell
$body = @{
    email = "admin@nextcellbeauty.com"
    password = "admin123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:4001/api/admin/auth/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

#### Expected Success Response (200 OK)

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": 1,
    "name": "Super Admin",
    "email": "admin@nextcellbeauty.com"
  }
}
```

#### Expected Error Response (400/401 Bad Request)

```json
{
  "message": "Invalid email or password."
}
```

#### cURL Command - Invalid Email

```bash
curl -X POST http://localhost:4001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "wrong@email.com",
    "password": "admin123"
  }'
```

#### cURL Command - Empty Password

```bash
curl -X POST http://localhost:4001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@nextcellbeauty.com",
    "password": ""
  }'
```

#### cURL Command - Missing Email

```bash
curl -X POST http://localhost:4001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "password": "admin123"
  }'
```

#### Postman Setup Instructions

1. **Create New Request**
   - Click "+" to create a new request tab
   - Name it: "Admin Login"

2. **Set Method & URL**
   - Method: `POST`
   - URL: `http://localhost:4001/api/admin/auth/login`

3. **Add Headers**
   - Key: `Content-Type`
   - Value: `application/json`

4. **Add Request Body** (raw JSON)
   ```json
   {
     "email": "admin@nextcellbeauty.com",
     "password": "admin123"
   }
   ```

5. **Send Request**
   - Click "Send"
   - View response in "Body" tab

6. **Save Token for Future Requests**
   - Once logged in, copy the `accessToken` from response
   - Use it in Authorization header for other protected endpoints:
     ```
     Authorization: Bearer {accessToken}
     ```

#### Using Token in Subsequent Requests

For any protected admin endpoint, add the access token:

```bash
curl -X GET http://localhost:4001/api/admin/dashboard \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

In Postman:
- Tab: "Headers"
- Key: `Authorization`
- Value: `Bearer {your_accessToken}`

---

## Sidebar Sections

### Overview
- **Dashboard** (`/dashboard`)
  - Live admin landing page showing revenue, orders, products, and customer metrics.
  - Includes placeholders for analytics and recent activity.
- **Analytics** (`/analytics`)
  - Planned section for store performance charts, revenue analytics, and reporting.

### Catalog
- **Products** (`/products`)
  - Planned product catalog management section.
- **Categories** (`/categories`)
  - Planned category management for product organization.
- **Brands** (`/brands`)
  - Planned brand management and brand-level catalog controls.

### Sales
- **Orders** (`/orders`)
  - Planned order management and order status tracking.
- **Returns & Refunds** (`/returns`)
  - Planned returns and refund request management.
- **Coupons & Offers** (`/coupons`)
  - Planned coupon, discount, and promotional offer management.

### Customers
- **Customers** (`/customers`)
  - Planned customer account and profile management.
- **Reviews** (`/reviews`)
  - Planned review moderation and product feedback management.

### Beauty Content
- **Tutorials** (`/tutorials`)
  - Planned beauty tutorial content management.
- **Skin Quiz** (`/skin-quiz`)
  - Planned skin quiz tool and results management.
- **Shade Finder** (`/shade-finder`)
  - Planned shade finder configuration tool.

### Website CMS
- **Banners** (`/banners`)
  - Planned homepage and campaign banner management.
- **Blog** (`/blog`)
  - Planned blog content management and post publishing.
- **FAQ** (`/faq`)
  - Planned FAQ content management section.
- **Policies** (`/policies`)
  - Planned site policy editor for terms, privacy, shipping, and returns.

### System
- **Settings** (`/settings`)
  - Planned admin settings and profile management.

---

## Current Implementation Status

### Implemented
- `Dashboard` page is implemented and wired through the main admin layout.
- Admin sidebar navigation is now active for all listed routes.
- Route placeholders have been added for all sidebar items, so clicking each link navigates correctly.

### Placeholder Pages
For the following routes, placeholder pages are currently used:
- `/analytics`
- `/products`
- `/categories`
- `/brands`
- `/orders`
- `/returns`
- `/coupons`
- `/customers`
- `/reviews`
- `/tutorials`
- `/skin-quiz`
- `/shade-finder`
- `/banners`
- `/blog`
- `/faq`
- `/policies`
- `/settings`

Each placeholder shows the section name and a short description until the final admin UI is implemented.

---

## Notes for Development

- The admin layout is built with `react-router-dom` and uses `ProtectedRoute` for authentication.
- `Sidebar.jsx` defines the menu structure and navigation links.
- The engine currently uses the admin app inside `next-cell-beauty-admin/src`.
- Add real page components in `src/pages/...` and update `src/App.jsx` routes accordingly.

---

## How to Use

1. Start the admin app in `next-cell-beauty-admin`.
2. Log in with admin credentials.
3. Use the sidebar to navigate to any admin section.
4. Replace placeholders with real features step-by-step.

---

## Future Enhancements

- Add CRUD interfaces for products, categories, and brands.
- Build order processing and returns/refunds workflows.
- Create analytics dashboards with charts and sales reports.
- Add customer management, review moderation, and support tools.
- Enable CMS editing for banners, blog posts, FAQs, and policies.
- Add admin profile settings and security controls.
