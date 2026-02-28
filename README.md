# Website

React + Vite + Hono + Tailwind + Cloudflare Workers

## Project Structure

- `src/web/` — React frontend: pages, components, styles, hooks
- `src/api/` — Hono API server (`/api/*`), database schema and migrations
- `public/` — Static assets (favicon, og-image, logo)


## Quick Start

```bash
# Install dependencies
bun install

# Generate types and run migrations
bun cf-typegen
bun db:generate
bun db:migrate

# Start dev server
bun dev
```

## shadcn/ui

Add components you need, customize them however you want.

```bash
bun x shadcn@latest add button card dialog
```

Components land in `src/web/components/ui/`, import with `@/components/ui/button`.

```tsx
import { Button } from "@/components/ui/button"

<Button variant="outline">Click me</Button>
```

## Routing

Client-side routing uses [wouter](https://github.com/molefrog/wouter). Add routes in `src/web/app.tsx`:

```tsx
import { Route, Switch } from "wouter";

<Switch>
  <Route path="/" component={Home} />
  <Route path="/about" component={About} />
</Switch>
```

## Database

Uses [Drizzle ORM](https://orm.drizzle.team/) with Cloudflare D1.

```bash
bun db:generate       # Generate migrations from schema
bun db:migrate        # Apply migrations locally
```

Schema is in `src/api/database/schema.ts`, migrations in `src/api/migrations/`.

## API

Backend uses [Hono](https://hono.dev/) on Cloudflare Workers. All routes are under `/api/*` in `src/api/index.ts`.

```ts
app.get('/api/hello', (c) => c.json({ message: 'Hello' }));
```

## Best Practices

### Code

- Functional style — use `const`, early returns, avoid nesting and `let`
- Prefer clarity over cleverness — no nested ternaries, no dense one-liners, explicit beats compact
- Import directly from modules — avoid barrel files for bundle size
- Parallelize async work with `Promise.all()` — never chain independent awaits
- Use existing libraries and shadcn/ui components over custom implementations

### React

- Compose with `children` and compound components — avoid boolean prop sprawl
- React 19 — no `forwardRef`, use `use()` instead of `useContext()`
- Derive state during render, not in effects — avoid unnecessary `useEffect`
- Use `startTransition` for non-urgent UI updates
- Memoize expensive computations, not simple primitives — don't over-optimize
- Keep components small and focused — one responsibility per file
- Fetch API data with `fetch("/api/...")` — no extra HTTP libraries needed

### Design

- Create a `DESIGN.md` early with chosen fonts, colors, spacing, and visual direction — reference it for all UI work to maintain cohesion
- Commit to a clear visual direction — bold or minimal, but intentional
- Avoid generic AI aesthetics — no default Inter/Roboto, no purple-on-white gradients
- Use distinctive typography pairings, strong color accents, and purposeful whitespace
- Prefer CSS variables and Tailwind for theming — keep styles consistent and systematic
- Motion should be purposeful — page transitions and hover states over scattered animations

## Config

`website.config.json` contains the site name, description, and URL — use it as the source of truth for site-wide values.