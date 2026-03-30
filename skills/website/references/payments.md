# Payments

We use [Autumn](https://useautumn.com) for payments and usage tracking.

**Pinned versions:** `autumn-js@1.2.0`, `atmn@1.1.8`.

**Docs:** [docs.useautumn.com/llms.txt](https://docs.useautumn.com/llms.txt) | [CLI config](https://docs.useautumn.com/cli/config)

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
  return <AutumnProvider useBetterAuth>{children}</AutumnProvider>;
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

Create `autumn.config.ts` in project root.

> `reset` and `price` are mutually exclusive on `item()` — but consumable metered features **must have one of them**. `included` must be >= 0 (never use -1). For unlimited, use `unlimited: true`.

```ts
import { feature, plan, item } from "atmn";

export const messages = feature({
  id: "messages",
  name: "Messages",
  type: "metered",       // "boolean" | "metered" | "credit_system"
  consumable: true,       // metered only: true (messages) or false (seats)
});

export const free = plan({
  id: "free",
  name: "Free",
  autoEnable: true,
  items: [
    item({
      featureId: messages.id,
      included: 100,
      reset: { interval: "month" },
    }),
  ],
});

export const pro = plan({
  id: "pro",
  name: "Pro",
  price: { amount: 2000, interval: "month" },
  items: [
    item({
      featureId: messages.id,
      included: 1000,
      reset: { interval: "month" },
    }),
  ],
});

// Example: usage-based pricing item (uses price, NOT reset)
export const payAsYouGo = plan({
  id: "pay_as_you_go",
  name: "Pay As You Go",
  items: [
    item({
      featureId: messages.id,
      price: { amount: 1, billingUnits: 1, billingMethod: "usage_based", interval: "month" },
    }),
  ],
});

export default {
  features: [messages],
  plans: [free, pro, payAsYouGo],
};
```

## 4. Frontend Access

Use `useCustomer` for customer state. Get plan info from Autumn, not from the database.

```tsx
import { useCustomer } from "autumn-js/react";

const { data: customer, isLoading } = useCustomer();

// Active plan
const activePlan = customer?.subscriptions?.[0]?.planId ?? "free";

const msgBalance = customer?.balances?.["messages"];
// msgBalance.remaining, msgBalance.granted, msgBalance.usage, msgBalance.unlimited
```

## 5. Listing Plans & Prices

Use `useListPlans` to fetch plans with prices from Autumn — never hardcode prices.

```tsx
import { useListPlans } from "autumn-js/react";

const { data: plans, isLoading } = useListPlans();
```

## 6. Checkout (Plan Attach)

v2 uses `attach()` — redirects to Stripe hosted checkout.

```tsx
import { useCustomer } from "autumn-js/react";

function PurchaseButton() {
  const { attach } = useCustomer();

  return (
    <button
      onClick={async () => {
        await attach({
          planId: "pro",
          successUrl: window.location.origin,
        });
      }}
    >
      Upgrade to Pro
    </button>
  );
}
```

## 7. Backend Check & Track

SDK reads `AUTUMN_SECRET_KEY` from env automatically:

```ts
import { Autumn } from "autumn-js";
const autumn = new Autumn();

// Check — verify if customer has enough balance before allowing access
// result.allowed: boolean, result.balance: { remaining, granted, usage, unlimited }
const result = await autumn.check({
  customerId: "user_id",
  featureId: "messages",
  requiredBalance: 1,          // minimum balance needed (default: 1)
});
if (!result.allowed) { /* blocked — throw error customer has insufficient balance */ }

// Track — record usage after the action succeeds, value defaults to 1
await autumn.track({
  customerId: "user_id",
  featureId: "messages",
  value: 1,
});
```

## 8. Backend Handler (autumnHandler)

For non-Better-Auth setups, mount `autumnHandler`:

```ts
import { autumnHandler } from "autumn-js/hono";

app.all("/api/autumn/*", autumnHandler({
  identify: async (c) => {
    const user = getAuthUser(c);
    return { customerId: user.id };
  },
}));
```

## CLI Commands (atmn@1.1.8)

`atmn init` | `atmn login` | `atmn push` (`-p` for prod, `-y` to confirm) | `atmn pull` | `atmn nuke` | `atmn env` | `atmn dashboard`

## Note on API Keys

Payments work out of the box — no API keys or setup required. The sandbox includes pre-configured keys, so user can test payments immediately.

If the user wants to view transactions on their own Stripe dashboard, guide them to connect their account in **Dashboard → Payments → Connect Stripe Sandbox** (for testing) or **Connect Stripe Production** (for live payments).
