# 🚀 Checkout & API Fixes

## ✅ Backend Updates Applied

I have updated the backend to fix the 500 error you were seeing.

### 1. Fixed "Stripe checkout failed" (500 Error)
The error was caused by two main issues:
1. **Price too low:** You sent `price: 21` (₹21). Stripe requires a minimum of ~₹50 for INR transactions.
2. **Metadata type mismatch:** Stripe requires all metadata values to be **strings**. You were sending `customDesign: true` (boolean).

**The backend now:**
- Auto-converts all metadata values to strings (fixing the boolean issue).
- Checks if price < ₹50 and returns a clear generic error: `"Price must be at least ₹50.00 for online payments"`.
- Logs detailed error information to the console for easier debugging.

### 2. Validated API Endpoints
Your backend is working correctly.
- Products exist.
- Stripe key is configured.

---

## 🛠️ Required Frontend Changes

You **MUST** update your frontend code to handle the new API structure and fix the price issue.

### 1. Update `apiConstants.ts`

Make sure your `src/utils/apiConstants.ts` (or wherever you keep it) has these endpoints:

```typescript
// ... other constants ...

export const API_ENDPOINTS = {
  // ... existing endpoints ...
  
  // ADD THIS SECTION:
  PRICING: {
    PHONE_CASE: `${BASE_URL}/api/pricing/phone-case`,
    T_SHIRT: `${BASE_URL}/api/pricing/t-shirt`
  },
  
  PAYMENT: {
    CREATE_CHECKOUT_SESSION: `${BASE_URL}/api/payment/create-checkout-session`
  }
};
```

### 2. Fix Price in `TShirtCustomizer.tsx` / `PhoneCaseCustomizer.tsx`

You are sending `price: 21`. This is likely a placeholder or bug.
Ensure you are fetching the **real price** from the backend:

```typescript
// Example for fetching price
useEffect(() => {
  const fetchPrice = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.PRICING.T_SHIRT);
      const data = await res.json();
      if (data.success && data.pricing) {
        // Update your state with REAL database prices
        // Example: data.pricing.tshirtTypes
        console.log('Fetched pricing:', data.pricing);
      }
    } catch (error) {
      console.error('Failed to fetch pricing');
    }
  };
  
  fetchPrice();
}, []);
```

### 3. Update `handleBuy` (Checkout Function)

Send the correct price (must be > ₹50):

```typescript
const handleBuy = async () => {
  // ...
  
  try {
    const response = await fetch(API_ENDPOINTS.PAYMENT.CREATE_CHECKOUT_SESSION, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // If needed
      },
      body: JSON.stringify({
        productId: product._id,
        price: 599, // ✅ Make sure this is > 50 (fetch from DB)
        metadata: {
          size: "L",
          color: "#ffffff",
          customDesign: "true" // ✅ Best practice: send as string
        }
      })
    });
    
    // ... handle response
  } catch (error) {
    console.error(error);
  }
};
```

## 🔄 How to Verify

1. Restart your backend (`npm run dev`).
2. Try the checkout button in your frontend.
3. **If it fails**, check the backend terminal. You will now see exactly why:
   - `❌ Price too low for Stripe: 21`
   - or `❌ Stripe checkout error: ...`

The detailed logging I added to `src/controllers/payment.controller.ts` acts as a debugger for you!
