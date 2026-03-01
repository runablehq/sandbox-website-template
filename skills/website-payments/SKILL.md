---
name: website-payments
description: Integrate Autumn payments and usage tracking with Better Auth, frontend checkout, and backend feature/usage checks.
---

# Setup Payments

We use [Autumn](https://useautumn.com) for payments and usage tracking.

Reference docs: [llms.txt](https://docs.useautumn.com/llms.txt)

<preflight>
Before wiring, state your assumptions about which features to gate, pricing tiers and their limits, billing model (boolean access vs usage-based vs credits), and whether there's a pricing page. The user will correct what's wrong.
</preflight>

<design_thinking>
A pricing page is a sales page, not a settings page — it should make the value of upgrading obvious at a glance. Checkout should feel frictionless; every extra click is drop-off. Upgrade prompts should be contextual (shown when the user hits a limit) not nagging (shown on every page load).
</design_thinking>

When integrating payments, always create `autumn.config.ts` with a reasonable default feature for the app domain (for example `todos`, `messages`, or `api_calls`).

## 1. Provider Setup

Wrap app provider in `src/web/components/provider.tsx`:

```tsx
import { AutumnProvider } from "autumn-js/react";

export function Provider({ children }: { children: React.ReactNode }) {
  // betterAuthUrl must be window.location.origin (host only, no path)
  // SDK appends /api/auth/autumn/* internally
  return <AutumnProvider betterAuthUrl={window.location.origin}>{children}</AutumnProvider>;
}
```

## 2. Better Auth Plugin

Add Autumn plugin in `src/api/auth.ts`:

```ts
import { autumn } from "autumn-js/better-auth";

export const auth = betterAuth({
  // ...other config
  plugins: [autumn()],
});
```

## 3. Autumn Config

Create `autumn.config.ts` in project root:

```ts
import { feature, product, featureItem, pricedFeatureItem, priceItem } from "atmn";

export const messages = feature({
  id: "messages",
  name: "Messages",
  type: "continuous_use",
});

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

Feature types:
- `boolean`: on/off access.
- `single_use`: one-time consumable.
- `continuous_use`: resets by interval.
- `credit_system`: credits shared across metered features.

Intervals:
- `minute`, `hour`, `day`, `week`, `month`, `quarter`, `semi_annual`, `year`

## 4. Frontend Access

Use `useCustomer` from `autumn-js/react`:

```tsx
import { useCustomer } from "autumn-js/react";

function MyComponent() {
  const { customer } = useCustomer();
  console.log("Autumn customer:", customer);
  return <div>Welcome!</div>;
}
```

## 5. Checkout Dialog

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

## 6. Backend Feature Checks

```ts
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

## 7. Usage Tracking

```ts
await autumn.track({
  customer_id: "user_id_from_auth",
  feature_id: "messages",
  value: 1,
});
```

Constraints:
- `value` must be positive (`>= 0`).
- Use `track()` to increment usage, never to decrement usage.
