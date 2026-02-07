# Setup Payments

We are using [Autumn](https://useautumn.com) for payments and usage tracking.

You can fetch documentation at [llms.txt](https://docs.useautumn.com/llms.txt). Explore the documentation if something is not explained below.

**Important:** When asked to integrate payments, always create `autumn.config.ts` with a reasonable default config based on the app's domain (e.g., "todos" for a todo app, "messages" for a chat app, "api_calls" for an API service).

## Provider Setup
1. Wrap your app with the AutumnProvider in `src/web/components/provider.tsx`:

```tsx
import { AutumnProvider } from "autumn-js/react";

export function Provider({ children }: { children: React.ReactNode }) {
  // betterAuthUrl must be window.location.origin (just the host, no path)
  // The SDK internally appends /api/auth/autumn/* to this URL
  return (
    <AutumnProvider betterAuthUrl={window.location.origin}>
      {children}
    </AutumnProvider>
  );
}
```

## Better Auth Integration
2. Add the autumn plugin to your Better Auth config in `src/api/auth.ts`:

```typescript
import { autumn } from "autumn-js/better-auth";

export const auth = betterAuth({
  // ... other config
  plugins: [
    autumn()
  ],
});
```

## Config
3. Add the following config at `autumn.config.ts` in the project root:

```typescript
import { feature, product, featureItem, pricedFeatureItem, priceItem } from "atmn";

// Define features
export const messages = feature({
  id: "messages",
  name: "Messages",
  type: "continuous_use",
});

// Define products/plans
export const freePlan = product({
  id: "free",
  name: "Free",
  is_default: true,
  items: [
    featureItem({
      feature_id: messages.id,
      included_usage: 100,
      interval: "month",
    }),
  ],
});

export const proPlan = product({
  id: "pro",
  name: "Pro",
  items: [
    priceItem({
      price: 200,
      interval: "month",
    }),
    pricedFeatureItem({
      feature_id: messages.id,
      price: 5,
      interval: "month",
      included_usage: 1000,
      billing_units: 100,
      usage_model: "pay_per_use",
    }),
  ],
});

export default {
  products: [freePlan, proPlan],
  features: [messages],
};
```

### Feature Types

| Type | Description | Use Case |
|------|-------------|----------|
| `boolean` | Simple on/off access | Feature flags, premium features |
| `single_use` | One-time consumable, doesn't reset | Lifetime credits, one-time purchases |
| `continuous_use` | Resets periodically based on interval | Monthly API calls, daily messages |
| `credit_system` | Credits that map to multiple metered features | AI credits for various models |

### Product Configuration

```typescript
product({
  id: "pro",              // Unique identifier
  name: "Pro Plan",       // Display name
  is_default: false,      // Auto-assign to new customers
  is_add_on: false,       // Can be added to existing plan
  group: "main",          // Group related products (for upgrades/downgrades)
  items: [...],           // Features and prices
  free_trial: {           // Optional trial period
    duration: "day",      // "day" | "month" | "year"
    length: 14,
    unique_fingerprint: true,
    card_required: false,
  },
})
```

### Product Items

**`priceItem`** - Flat recurring price:
```typescript
priceItem({
  price: 2000,            // Price in cents ($20.00)
  interval: "month",      // Billing interval
})
```

**`featureItem`** - Include a feature with usage limits (no extra charge):
```typescript
featureItem({
  feature_id: "messages",
  included_usage: 1000,   // Or "inf" for unlimited
  interval: "month",      // Reset interval
  reset_usage_when_enabled: true, // Reset on plan change
})
```

**`pricedFeatureItem`** - Feature with usage-based pricing:
```typescript
pricedFeatureItem({
  feature_id: "messages",
  included_usage: 1000,   // Free included amount
  price: 5,               // Price per billing_units (in cents)
  billing_units: 100,     // e.g., $0.05 per 100 messages
  interval: "month",
  usage_model: "prepaid" | "pay_per_use",
  // Alternatively use tiers for volume pricing:
  tiers: [
    { to: 1000, amount: 10 },   // $0.10 per unit up to 1000
    { to: 10000, amount: 5 },   // $0.05 per unit up to 10000
    { to: "inf", amount: 2 },   // $0.02 per unit thereafter
  ],
})
```

### Intervals

Available intervals: `minute`, `hour`, `day`, `week`, `month`, `quarter`, `semi_annual`, `year`

## Frontend Usage

### Access Customer Data
4. Use the `useCustomer` hook to access customer/subscription info:

```tsx
import { useCustomer } from "autumn-js/react";

function MyComponent() {
  const { customer } = useCustomer();
  console.log("Autumn customer:", customer);
  return <div>Welcome!</div>;
}
```

### Checkout Dialog
5. Use `checkout` with `CheckoutDialog` to let users purchase a plan:

```tsx
import { useCustomer, CheckoutDialog } from "autumn-js/react";

function PurchaseButton() {
  const { checkout } = useCustomer();

  return (
    <button
      onClick={async () => {
        await checkout({
          productId: "pro",
          dialog: CheckoutDialog,
          successUrl: window.location.origin,
        });
      }}
    >
      Select Pro Plan
    </button>
  );
}
```

## Backend Usage

### Check Feature Access
6. Use the Autumn SDK to check if a user has access to a feature:

```typescript
import { Autumn } from "autumn-js";

const autumn = new Autumn({
  secretKey: process.env.AUTUMN_SECRET_KEY,
});

const { data } = await autumn.check({
  customer_id: "user_id_from_auth",
  feature_id: "messages",
  required_balance: 1,
});

if (!data.allowed) {
  console.log("User has run out of messages");
  return;
}
```

### Track Usage
7. Use `autumn.track()` to record consumable usage (AI messages, credits, API calls):

```typescript
await autumn.track({
  customer_id: "user_id_from_auth",
  feature_id: "messages",
  value: 1,
});
```

**Important constraints:**
- `value` must be a positive number (>= 0) - you cannot track negative usage
- Use `track()` for incrementing usage (e.g., user sent a message)
- Each track call decrements the user's balance by the value

### Set Usage Directly
8. Use `autumn.usage()` for non-consumable features (seats, workspaces) where you want to set the absolute value:

```typescript
await autumn.usage({
  customer_id: "user_id_from_auth",
  feature_id: "seats",
  value: 3,
});
```

**Important constraints:**
- `value` must be >= 0 - you cannot set negative usage
- This overwrites the current usage value rather than incrementing it
- Use for features where you track "current count" not "consumption" (e.g., active seats, projects)

### Adjust Balance
9. Use `autumn.customers.updateBalances()` to directly set or adjust a customer's balance:

```typescript
// Set balance to a specific value
await autumn.customers.updateBalances("user_id", {
  feature_id: "messages",
  balance: 500,  // Set balance to 500
});

// Or update multiple features at once
await autumn.customers.updateBalances("user_id", [
  { feature_id: "messages", balance: 500 },
  { feature_id: "api_calls", balance: 1000 },
]);
```

Use this for:
- Granting bonus credits
- Manual adjustments
- Refunds (increase balance)

## Final Step

**IMPORTANT:** After completing the integration, run `bunx atmn push` to sync your config with Autumn.