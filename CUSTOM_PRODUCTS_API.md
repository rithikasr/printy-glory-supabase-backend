# Custom Product Backend API Documentation

## Overview
This document describes the backend API endpoints for the custom phone case and t-shirt customizer features.

## Base URL
```
http://localhost:3000
```

---

## 📱 Phone Model Endpoints

### 1. Request New Phone Model (Public)
**Endpoint:** `POST /api/phone-models/request`

**Description:** Allows users to request support for a new phone model that isn't currently available.

**Request Body:**
```json
{
  "brand": "Samsung",
  "model": "Galaxy S24 Ultra",
  "email": "user@example.com" // Optional
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Phone model request submitted successfully",
  "request": {
    "_id": "...",
    "brand": "Samsung",
    "model": "Galaxy S24 Ultra",
    "email": "user@example.com",
    "status": "pending",
    "createdAt": "2026-02-16T...",
    "updatedAt": "2026-02-16T..."
  }
}
```

**Frontend Usage:**
```typescript
const response = await fetch(API_ENDPOINTS.PHONE_MODELS.REQUEST, {
  method: 'POST',
  headers: getAuthHeaders(),
  body: JSON.stringify({
    brand: requestBrand,
    model: requestModel,
    email: requestEmail
  })
});
```

---

### 2. Get All Phone Model Requests (Admin Only)
**Endpoint:** `GET /api/phone-models/requests`

**Headers Required:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 5,
  "requests": [
    {
      "_id": "...",
      "brand": "Samsung",
      "model": "Galaxy S24 Ultra",
      "email": "user@example.com",
      "status": "pending",
      "createdAt": "2026-02-16T...",
      "updatedAt": "2026-02-16T..."
    }
  ]
}
```

---

### 3. Update Phone Model Request Status (Admin Only)
**Endpoint:** `PATCH /api/phone-models/requests/:id/status`

**Headers Required:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "status": "approved" // or "pending" or "rejected"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Status updated successfully",
  "request": {
    "_id": "...",
    "brand": "Samsung",
    "model": "Galaxy S24 Ultra",
    "status": "approved",
    ...
  }
}
```

---

## 🛍️ Product Endpoints

### 1. Get Product by ID (Public)
**Endpoint:** `GET /api/products/:id`

**Description:** Fetch a specific product by its MongoDB ObjectId.

**Response (200 OK):**
```json
{
  "success": true,
  "product": {
    "_id": "6989b4e9056f78d7517dee41",
    "name": "Custom Phone Case",
    "price": 499,
    "category": "phone-case",
    "stock": 100,
    "image": "https://...",
    ...
  }
}
```

**Frontend Usage:**
```typescript
const res = await fetch(API_ENDPOINTS.PRODUCTS.BY_ID(productId), {
  headers: getAuthHeaders(),
});
const data = await res.json();
if (data.product) {
  setTargetProduct(data.product);
}
```

---

## 💳 Payment Endpoints

### 1. Create Checkout Session (Protected)
**Endpoint:** `POST /api/payment/create-checkout-session`

**Headers Required:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Description:** Creates a Stripe checkout session. Now supports custom pricing and metadata for customized products.

**Request Body (Basic):**
```json
{
  "productId": "6989b4e9056f78d7517dee41"
}
```

**Request Body (Custom T-Shirt):**
```json
{
  "productId": "6989b4e9056f78d7517dee41",
  "price": 799,
  "metadata": {
    "shirtType": "Polo T-Shirt",
    "size": "L",
    "color": "#1e3a8a",
    "customDesign": true
  }
}
```

**Request Body (Custom Phone Case):**
```json
{
  "productId": "6989b4e9056f78d7517dee41",
  "price": 499,
  "metadata": {
    "phoneModel": "iPhone 15 Pro Max",
    "caseColor": "#ffffff",
    "customDesign": true
  }
}
```

**Response (200 OK):**
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

**Frontend Usage (T-Shirt):**
```typescript
const handleBuy = async () => {
  const selectedType = TSHIRT_TYPES.find(t => t.id === shirtType);
  const price = selectedType?.price || targetProduct?.price || 599;

  const res = await fetch(API_ENDPOINTS.PAYMENT.CREATE_CHECKOUT_SESSION, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      productId: targetProduct._id || targetProduct.id,
      price: price,
      metadata: {
        shirtType: selectedType?.name,
        size,
        color,
        customDesign: true
      }
    }),
  });

  const data = await res.json();
  if (data.url) {
    window.location.href = data.url; // Redirect to Stripe
  }
};
```

---

## 🔐 Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Public Endpoints (No Auth Required):
- `GET /api/products` - Browse all products
- `GET /api/products/:id` - Get specific product
- `POST /api/phone-models/request` - Request new phone model
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Protected Endpoints (Auth Required):
- `POST /api/payment/create-checkout-session` - Create checkout
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add to cart
- `GET /api/orders` - Get user orders
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)
- `GET /api/phone-models/requests` - Get all requests (admin)
- `PATCH /api/phone-models/requests/:id/status` - Update request status (admin)

---

## 📊 Database Models

### PhoneModelRequest Schema
```typescript
{
  brand: String (required),
  model: String (required),
  email: String (optional),
  status: 'pending' | 'approved' | 'rejected' (default: 'pending'),
  createdAt: Date,
  updatedAt: Date
}
```

### Product Schema (Existing)
```typescript
{
  name: String,
  price: Number,
  category: String,
  stock: Number,
  image: String,
  description: String,
  ...
}
```

---

## 🎨 Frontend Integration Examples

### apiConstants.ts Structure
```typescript
export const API_ENDPOINTS = {
  PRODUCTS: {
    BASE: '/api/products',
    BY_ID: (id: string) => `/api/products/${id}`
  },
  PHONE_MODELS: {
    REQUEST: '/api/phone-models/request',
    REQUESTS: '/api/phone-models/requests', // Admin
    UPDATE_STATUS: (id: string) => `/api/phone-models/requests/${id}/status` // Admin
  },
  PAYMENT: {
    CREATE_CHECKOUT_SESSION: '/api/payment/create-checkout-session'
  }
};
```

---

## ✅ Testing the Endpoints

### Test Phone Model Request
```bash
curl -X POST http://localhost:3000/api/phone-models/request \
  -H "Content-Type: application/json" \
  -d '{
    "brand": "OnePlus",
    "model": "OnePlus 12",
    "email": "test@example.com"
  }'
```

### Test Get Product by ID
```bash
curl http://localhost:3000/api/products/6989b4e9056f78d7517dee41
```

### Test Custom Checkout (requires auth token)
```bash
curl -X POST http://localhost:3000/api/payment/create-checkout-session \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "productId": "6989b4e9056f78d7517dee41",
    "price": 799,
    "metadata": {
      "shirtType": "Polo T-Shirt",
      "size": "L",
      "color": "#1e3a8a"
    }
  }'
```

---

## 🚀 Next Steps

1. **Create Products in Database:**
   - Create a "Custom Phone Case" product with `category: "phone-case"`
   - Create a "Custom T-Shirt" product with `category: "t-shirt"`

2. **Frontend Configuration:**
   - Update `apiConstants.ts` with the endpoints above
   - Ensure `getAuthHeaders()` includes JWT token for protected routes

3. **Admin Panel:**
   - Add UI to view phone model requests
   - Add UI to approve/reject requests
   - Optionally send email notifications when requests are approved

---

## 📝 Notes

- All prices are in INR (Indian Rupees)
- Stripe checkout amounts are multiplied by 100 (e.g., ₹799 → 79900 paise)
- Custom metadata is stored in Stripe session and can be retrieved in webhooks
- Phone model requests are stored in MongoDB for admin review
- The backend automatically handles double slashes in URLs (e.g., `//api/products` → `/api/products`)
