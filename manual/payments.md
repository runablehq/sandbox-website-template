# Setup Payments

We are using [Autumn](https://useautumn.com) for payments and usage tracking.

## Provider Setup
Wrap your app with the AutumnProvider in `src/web/components/provider.tsx`:

```tsx
import { AutumnProvider } from "autumn-js/react";

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <AutumnProvider betterAuthUrl={import.meta.env.VITE_BASE_URL}>
      {children}
    </AutumnProvider>
  );
}
```

## Better Auth Integration
Add the autumn plugin to your Better Auth config in `src/api/auth.ts`:

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
Add the following config at `autumn.config.ts` in the project root:

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

## Environment Variables
These environment variables are already present in `.env` and can be used directly.
- `AUTUMN_SECRET_KEY`
