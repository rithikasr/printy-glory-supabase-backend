# Product Pricing Management System

## Overview
Admin-configurable pricing system for phone cases and t-shirt types. Admins can set and update prices through API endpoints, and the frontend fetches current pricing dynamically.

---

## 🎯 Features

1. **Phone Case Pricing** - Single base price for all phone cases
2. **T-Shirt Type Pricing** - Different prices for each t-shirt style:
   - Half Sleeve (Rounded Neck)
   - V-Neck
   - Polo
   - Full Sleeve
   - Oversized
   - Sweatshirt

---

## 📡 API Endpoints

### Public Endpoints (Frontend)

#### 1. Get Phone Case Pricing
```
GET /api/pricing/phone-case
```

**Response:**
```json
{
  "success": true,
  "pricing": {
    "_id": "...",
    "productType": "phone-case",
    "basePrice": 499,
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Frontend Usage:**
```typescript
const fetchPhoneCasePricing = async () => {
  const res = await fetch('/api/pricing/phone-case');
  const data = await res.json();
  return data.pricing.basePrice; // 499
};
```

---

#### 2. Get T-Shirt Pricing
```
GET /api/pricing/t-shirt
```

**Response:**
```json
{
  "success": true,
  "pricing": {
    "_id": "...",
    "productType": "t-shirt",
    "tshirtTypes": [
      { "id": "half-sleeve", "name": "Rounded Neck (Half Sleeve)", "price": 599 },
      { "id": "v-neck", "name": "V-Neck T-Shirt", "price": 649 },
      { "id": "polo", "name": "Polo T-Shirt", "price": 799 },
      { "id": "full-sleeve", "name": "Full Sleeve T-Shirt", "price": 699 },
      { "id": "oversized", "name": "Oversized T-Shirt", "price": 749 },
      { "id": "sweatshirt", "name": "Sweatshirt", "price": 999 }
    ],
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Frontend Usage:**
```typescript
const fetchTShirtPricing = async () => {
  const res = await fetch('/api/pricing/t-shirt');
  const data = await res.json();
  
  // Create a map for easy lookup
  const priceMap = {};
  data.pricing.tshirtTypes.forEach(type => {
    priceMap[type.id] = type.price;
  });
  
  return priceMap;
  // { 'half-sleeve': 599, 'polo': 799, ... }
};
```

---

### Admin Endpoints (Protected)

**All admin endpoints require authentication:**
```
Authorization: Bearer <JWT_TOKEN>
```

---

#### 3. Initialize Default Pricing (One-time setup)
```
POST /api/admin/pricing/initialize
```

**Description:** Sets up default pricing for both phone cases and t-shirts.

**Response:**
```json
{
  "success": true,
  "message": "Default pricing initialized successfully",
  "pricing": [
    {
      "productType": "phone-case",
      "basePrice": 499,
      ...
    },
    {
      "productType": "t-shirt",
      "tshirtTypes": [...],
      ...
    }
  ]
}
```

---

#### 4. Get All Pricing Configurations
```
GET /api/admin/pricing
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "pricing": [
    { "productType": "phone-case", ... },
    { "productType": "t-shirt", ... }
  ]
}
```

---

#### 5. Update Phone Case Pricing
```
POST /api/admin/pricing/phone-case
```

**Request Body:**
```json
{
  "basePrice": 599
}
```

**Response:**
```json
{
  "success": true,
  "message": "Phone case pricing updated successfully",
  "pricing": {
    "productType": "phone-case",
    "basePrice": 599,
    ...
  }
}
```

**Example (PowerShell):**
```powershell
$body = @{basePrice=599} | ConvertTo-Json
Invoke-WebRequest -Uri 'http://localhost:3000/api/admin/pricing/phone-case' `
  -Method POST `
  -ContentType 'application/json' `
  -Headers @{Authorization='Bearer YOUR_JWT_TOKEN'} `
  -Body $body
```

---

#### 6. Update T-Shirt Pricing
```
POST /api/admin/pricing/t-shirt
```

**Request Body:**
```json
{
  "tshirtTypes": [
    { "id": "half-sleeve", "name": "Rounded Neck (Half Sleeve)", "price": 649 },
    { "id": "v-neck", "name": "V-Neck T-Shirt", "price": 699 },
    { "id": "polo", "name": "Polo T-Shirt", "price": 849 },
    { "id": "full-sleeve", "name": "Full Sleeve T-Shirt", "price": 749 },
    { "id": "oversized", "name": "Oversized T-Shirt", "price": 799 },
    { "id": "sweatshirt", "name": "Sweatshirt", "price": 1099 }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "T-shirt pricing updated successfully",
  "pricing": {
    "productType": "t-shirt",
    "tshirtTypes": [...],
    ...
  }
}
```

**Example (PowerShell):**
```powershell
$tshirtTypes = @(
  @{id='half-sleeve'; name='Rounded Neck (Half Sleeve)'; price=649},
  @{id='v-neck'; name='V-Neck T-Shirt'; price=699},
  @{id='polo'; name='Polo T-Shirt'; price=849},
  @{id='full-sleeve'; name='Full Sleeve T-Shirt'; price=749},
  @{id='oversized'; name='Oversized T-Shirt'; price=799},
  @{id='sweatshirt'; name='Sweatshirt'; price=1099}
)
$body = @{tshirtTypes=$tshirtTypes} | ConvertTo-Json -Depth 3

Invoke-WebRequest -Uri 'http://localhost:3000/api/admin/pricing/t-shirt' `
  -Method POST `
  -ContentType 'application/json' `
  -Headers @{Authorization='Bearer YOUR_JWT_TOKEN'} `
  -Body $body
```

---

#### 7. Delete Pricing Configuration
```
DELETE /api/admin/pricing/:type
```

**Parameters:**
- `type`: `phone-case` or `t-shirt`

**Example:**
```
DELETE /api/admin/pricing/phone-case
```

**Response:**
```json
{
  "success": true,
  "message": "Pricing deleted successfully"
}
```

---

## 🔄 Frontend Integration

### Phone Case Customizer

Update `PhoneCaseCustomizer.tsx`:

```typescript
import { useState, useEffect } from 'react';

const [phoneCasePrice, setPhoneCasePrice] = useState(499); // Default

useEffect(() => {
  const fetchPricing = async () => {
    try {
      const res = await fetch('/api/pricing/phone-case');
      const data = await res.json();
      if (data.success) {
        setPhoneCasePrice(data.pricing.basePrice);
      }
    } catch (err) {
      console.error('Failed to fetch pricing:', err);
      // Keep default price
    }
  };
  fetchPricing();
}, []);

// Use phoneCasePrice in checkout
const handleBuy = async () => {
  const res = await fetch(API_ENDPOINTS.PAYMENT.CREATE_CHECKOUT_SESSION, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      productId: targetProduct._id,
      price: phoneCasePrice, // Dynamic price from admin
      metadata: {
        phoneModel: selectedModel,
        caseColor: caseColor,
        customDesign: true
      }
    }),
  });
  // ...
};
```

---

### T-Shirt Customizer

Update `TShirtCustomizer.tsx`:

```typescript
import { useState, useEffect } from 'react';

const [tshirtPricing, setTshirtPricing] = useState({
  'half-sleeve': 599,
  'v-neck': 649,
  'polo': 799,
  'full-sleeve': 699,
  'oversized': 749,
  'sweatshirt': 999
});

useEffect(() => {
  const fetchPricing = async () => {
    try {
      const res = await fetch('/api/pricing/t-shirt');
      const data = await res.json();
      if (data.success) {
        const priceMap = {};
        data.pricing.tshirtTypes.forEach(type => {
          priceMap[type.id] = type.price;
        });
        setTshirtPricing(priceMap);
      }
    } catch (err) {
      console.error('Failed to fetch pricing:', err);
      // Keep default prices
    }
  };
  fetchPricing();
}, []);

// Use dynamic pricing in checkout
const handleBuy = async () => {
  const price = tshirtPricing[shirtType] || 599;
  
  const res = await fetch(API_ENDPOINTS.PAYMENT.CREATE_CHECKOUT_SESSION, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      productId: targetProduct._id,
      price: price, // Dynamic price from admin
      metadata: {
        shirtType: TSHIRT_TYPES.find(t => t.id === shirtType)?.name,
        size,
        color,
        customDesign: true
      }
    }),
  });
  // ...
};

// Update preview modal to show dynamic price
<span className="text-2xl font-bold">
  ₹{tshirtPricing[shirtType] || 599}
</span>
```

---

## 🗄️ Database Schema

### ProductPricing Collection

```javascript
{
  _id: ObjectId,
  productType: String, // 'phone-case' or 't-shirt'
  basePrice: Number,   // For phone cases only
  tshirtTypes: [       // For t-shirts only
    {
      id: String,      // 'half-sleeve', 'polo', etc.
      name: String,    // Display name
      price: Number    // Price in INR
    }
  ],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 Setup Instructions

### 1. Initialize Default Pricing (First Time)

**Option A: Using API (requires admin JWT token)**
```bash
POST /api/admin/pricing/initialize
```

**Option B: Using MongoDB directly**
```javascript
// Connect to MongoDB and run:
db.productpricings.insertMany([
  {
    productType: 'phone-case',
    basePrice: 499,
    isActive: true
  },
  {
    productType: 't-shirt',
    tshirtTypes: [
      { id: 'half-sleeve', name: 'Rounded Neck (Half Sleeve)', price: 599 },
      { id: 'v-neck', name: 'V-Neck T-Shirt', price: 649 },
      { id: 'polo', name: 'Polo T-Shirt', price: 799 },
      { id: 'full-sleeve', name: 'Full Sleeve T-Shirt', price: 699 },
      { id: 'oversized', name: 'Oversized T-Shirt', price: 749 },
      { id: 'sweatshirt', name: 'Sweatshirt', price: 999 }
    ],
    isActive: true
  }
]);
```

### 2. Update Frontend Code

Add pricing fetch logic to both customizers as shown above.

### 3. Create Admin Panel (Optional)

Build a simple admin UI to manage pricing:
- Display current prices
- Forms to update phone case price
- Forms to update t-shirt prices
- Real-time preview

---

## 📊 Example Admin Panel Component

```typescript
// AdminPricingPanel.tsx
import { useState, useEffect } from 'react';

export default function AdminPricingPanel() {
  const [phoneCasePrice, setPhoneCasePrice] = useState(499);
  const [tshirtTypes, setTshirtTypes] = useState([]);
  
  useEffect(() => {
    fetchAllPricing();
  }, []);
  
  const fetchAllPricing = async () => {
    const res = await fetch('/api/admin/pricing', {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    const data = await res.json();
    // Update state...
  };
  
  const updatePhoneCasePrice = async () => {
    await fetch('/api/admin/pricing/phone-case', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify({ basePrice: phoneCasePrice })
    });
    alert('Phone case price updated!');
  };
  
  const updateTShirtPricing = async () => {
    await fetch('/api/admin/pricing/t-shirt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify({ tshirtTypes })
    });
    alert('T-shirt pricing updated!');
  };
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Pricing Management</h2>
      
      {/* Phone Case Pricing */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Phone Case</h3>
        <input
          type="number"
          value={phoneCasePrice}
          onChange={(e) => setPhoneCasePrice(Number(e.target.value))}
          className="border p-2 rounded"
        />
        <button onClick={updatePhoneCasePrice} className="ml-2 bg-blue-500 text-white px-4 py-2 rounded">
          Update
        </button>
      </div>
      
      {/* T-Shirt Pricing */}
      <div>
        <h3 className="text-xl font-semibold mb-2">T-Shirt Types</h3>
        {tshirtTypes.map((type, index) => (
          <div key={type.id} className="mb-2">
            <span className="inline-block w-48">{type.name}</span>
            <input
              type="number"
              value={type.price}
              onChange={(e) => {
                const updated = [...tshirtTypes];
                updated[index].price = Number(e.target.value);
                setTshirtTypes(updated);
              }}
              className="border p-2 rounded w-24"
            />
          </div>
        ))}
        <button onClick={updateTShirtPricing} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
          Update All
        </button>
      </div>
    </div>
  );
}
```

---

## ✅ Testing Checklist

- [ ] Initialize default pricing
- [ ] Fetch phone case pricing from frontend
- [ ] Fetch t-shirt pricing from frontend
- [ ] Update phone case price via admin endpoint
- [ ] Update t-shirt prices via admin endpoint
- [ ] Verify checkout uses correct dynamic prices
- [ ] Test with different t-shirt types
- [ ] Verify Stripe session metadata includes correct price

---

## 🔐 Security Notes

- All admin endpoints require JWT authentication
- Validate price values (must be positive numbers)
- Consider adding role-based access control (only admins can update pricing)
- Log all pricing changes for audit trail

---

## 📝 Notes

- Prices are stored in INR (Indian Rupees)
- Frontend should handle pricing fetch errors gracefully with fallback defaults
- Consider caching pricing data in frontend to reduce API calls
- Pricing updates take effect immediately for new orders
- Existing orders retain their original pricing
