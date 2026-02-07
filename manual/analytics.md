# Setup Analytics

We are using [Runable Analytics](https://onedollarstats.com) for privacy-friendly website analytics.

## Usage
1. Create a hook for analytics in `src/web/hooks/use-analytics.ts`:

```typescript
export const useAnalytics = () => ({
  trackEvent: (name: string, props?: Record<string, unknown>) => {
    window.stonks?.event(name, props)
  },
  trackView: (path?: string, props?: Record<string, unknown>) => {
    window.stonks?.view(path, props)
  }
})
```

Usage in components:

```tsx
import { useAnalytics } from "../hooks/use-analytics"

function PricingPage() {
  const { trackEvent } = useAnalytics()

  const handlePlanSelect = (plan: string) => {
    trackEvent("plan_selected", { plan })
  }

  return (
    <button onClick={() => handlePlanSelect("pro")}>
      Select Pro
    </button>
  )
}
```
