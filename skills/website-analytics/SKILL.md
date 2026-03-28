---
name: website-analytics
description: Set up Databuddy analytics in this project. Use when adding page views, event tracking, or analytics hooks in React components.
---

# Website analytics (Databuddy)

We use [Databuddy](https://databuddy.cc/) for privacy-first analytics. The tracking script is injected at build time by `vite/plugins/databuddy-analytics-plugin.ts` (same idea as the old Runable/OneDollarStats tag).

## Configuration

1. Create a project in [app.databuddy.cc](https://app.databuddy.cc/) and copy the **Client ID**.
2. Set either:
   - `databuddyClientId` in `website.config.json`, or
   - `VITE_DATABUDDY_CLIENT_ID` in `.env` (wins over the JSON file).

Optional in `website.config.json`:

- `databuddyScriptUrl` — default `https://cdn.databuddy.cc/databuddy.js`
- `databuddyApiUrl` — default `https://basket.databuddy.cc`

If no client ID is set, the plugin skips injecting the script.

## Hook: `useAnalytics`

The template includes `src/web/hooks/use-analytics.ts`: it wraps `track()` from `@databuddy/sdk` and `window.databuddy.screenView()` for SPA page views. `track()` delegates to `window.databuddy` / `window.db` once the loader script has run.

## Use in components

```tsx
import { useAnalytics } from "@/hooks/use-analytics";

function PricingPage() {
  const { trackEvent } = useAnalytics();

  const handlePlanSelect = (plan: string) => {
    trackEvent("plan_selected", { plan });
  };

  return <button onClick={() => handlePlanSelect("pro")}>Select Pro</button>;
}
```

## SPA page views (wouter)

```tsx
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAnalytics } from "@/hooks/use-analytics";

function AnalyticsRouteListener() {
  const [location] = useLocation();
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView(location);
  }, [location, trackPageView]);

  return null;
}
```

Mount `<AnalyticsRouteListener />` once inside your app shell (e.g. next to `<Switch>`).

## Direct `window` API

After load, the script exposes `window.databuddy` (alias `window.db`):

- `track(name, properties?)` — custom events
- `screenView(properties?)` — manual screen/page views
- `setGlobalProperties(properties)` — attach to all future events
- `flush()` / `clear()` — send queue / reset session

Example from the [getting started guide](https://www.databuddy.cc/docs/getting-started.md):

```ts
window.databuddy?.track("signup_completed", {
  source: "landing_page",
  plan: "pro",
});
```

## Types

`src/web/types/analytics.d.ts` references `@databuddy/sdk` so `window.databuddy` and `track()` stay typed.

## Further reading

- [Getting started](https://www.databuddy.cc/docs/getting-started.md)
- [React integration](https://www.databuddy.cc/docs/Integrations/react.md)
- [LLM-friendly index](https://databuddy.cc/llms.txt)
