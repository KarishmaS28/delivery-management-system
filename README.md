# Mini Logistics / Delivery Management System

A full-stack delivery management system with role-based access for Customers, Admins, and Drivers.

## Tech Stack

- **Backend**: Node.js, Express.js, PostgreSQL, JWT
- **Frontend**: React.js, React Router, Axios
- **Docs**: Swagger (OpenAPI 3.0)

---

## Project Structure

```
deliveryManagementSystem/
├── backend/
│   ├── migrations/
│   │   └── migrate.js          # DB schema migration
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── orderController.js
│   │   ├── db/
│   │   │   └── pool.js         # PostgreSQL connection pool
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT auth + RBAC middleware
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   └── orders.js
│   │   ├── validators/
│   │   │   └── index.js        # express-validator rules
│   │   └── app.js              # Express entry point
│   ├── .env
│   └── package.json
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── api/
    │   │   └── client.js       # Axios instance
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   └── ProtectedRoute.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── CreateOrder.js
    │   │   ├── OrdersList.js
    │   │   ├── AssignDriver.js
    │   │   └── DriverDashboard.js
    │   ├── App.js
    │   └── index.js
    ├── .env
    └── package.json
```

---

## Database Schema

```sql
-- Users
CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  role        VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'driver', 'admin')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id               SERIAL PRIMARY KEY,
  customer_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pickup_address   TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  status           VARCHAR(20) NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'assigned', 'picked', 'delivered')),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Deliveries
CREATE TABLE deliveries (
  id          SERIAL PRIMARY KEY,
  order_id    INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  driver_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(order_id)
);
```

---

## Setup Instructions

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 14

### 1. Clone & Setup Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL credentials and JWT secret
npm install
```

### 2. Create Database & Run Migration

```bash
# Create the database in PostgreSQL
psql -U postgres -c "CREATE DATABASE delivery_db;"

# Run migration
npm run migrate
```

### 3. Start Backend

```bash
npm run dev     # development (nodemon)
# or
npm start       # production
```

Backend runs on: `http://localhost:8000`  
Swagger docs: `http://localhost:8000/api-docs`

### 4. Setup & Start Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm start
```

Frontend runs on: `http://localhost:3000`

---

## API Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login, get JWT |
| POST | `/api/orders` | Customer | Create order |
| GET | `/api/orders` | Admin, Customer | List orders (paginated, filterable) |
| GET | `/api/orders/drivers` | Admin | List all drivers |
| GET | `/api/orders/my` | Driver | Driver's assigned orders |
| PATCH | `/api/orders/:id/assign` | Admin | Assign driver to order |
| PATCH | `/api/orders/:id/status` | Driver | Update order status |

### Query Parameters (GET /api/orders, GET /api/orders/my)
- `page` (integer, default: 1)
- `limit` (integer, default: 10, max: 100)
- `status` (pending | assigned | picked | delivered)

---

## Status Transitions

```
pending → assigned  (Admin assigns driver)
assigned → picked   (Driver marks as picked)
picked → delivered  (Driver marks as delivered)
```

---

## Authentication

All protected routes require:
```
Authorization: Bearer <jwt_token>
```

---

## Role-Based Access

| Feature | Customer | Admin | Driver |
|---------|----------|-------|--------|
| Create Order | ✅ | ❌ | ❌ |
| View Own Orders | ✅ | ❌ | ❌ |
| View All Orders | ❌ | ✅ | ❌ |
| Assign Driver | ❌ | ✅ | ❌ |
| View Assigned Orders | ❌ | ❌ | ✅ |
| Update Status | ❌ | ❌ | ✅ |

---

## Environment Variables

### Backend `.env`
```
PORT=8000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mini_logistics
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=9f8a7c6b5e4d3c2b1a0f9e8d7c6b5a4f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4
JWT_EXPIRES_IN=7d
```

### Frontend `.env`
```
REACT_APP_API_URL=http://localhost:8000/api
```
