# Website

React + Vite + Hono + Tailwind + Cloudflare Workers

<preflight>
Before building or changing anything, form a plan and present it to the user. The plan should include your assumptions about what's being built, which parts of the stack are involved (frontend, API, database, routing), what the visual direction is for any UI work, and what files you expect to create or modify.

State these as decisions, not questions. The user will correct what's wrong and ignore what's right.

Do not start implementation until the user has seen the plan and either approved or adjusted it.
</preflight>

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

<design_thinking>
Before writing any UI code, understand the context and commit to a clear aesthetic direction. Ask: what is this interface for, who uses it, and what should it feel like? Then pick a tone and execute it with precision — brutally minimal, maximalist, retro-futuristic, editorial, luxury, playful, brutalist, organic. Bold maximalism and refined minimalism both work. The key is intentionality, not intensity.

Create a `DESIGN.md` early with chosen fonts, colors, spacing, and visual direction. Reference it for all UI work to maintain cohesion. This is the style anchor — every component, page, and interaction should feel like it belongs to the same system.

Typography does the heavy lifting. Choose fonts that are beautiful, unique, and characterful. Never default to Inter, Roboto, Arial, or system fonts. Pair a distinctive display font with a refined body font. Strong size contrast between headings and body. Weight creates hierarchy. Generous line height. Text should never feel crowded.

Color commits, it doesn't hedge. Use CSS variables and Tailwind for theming. A dominant color with sharp accents outperforms a timid, evenly-distributed palette. Cohesion comes from a few intentional colors plus neutrals — accents appear sparingly, for emphasis, not decoration.

Composition breaks expectations. Asymmetric layouts, overlapping elements, diagonal flow, grid-breaking moments, generous negative space or controlled density. Unexpected spatial choices are what separate designed from generated.

Backgrounds create atmosphere. Don't default to solid colors. Gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, grain overlays — these add depth and context. Match the effect to the aesthetic.

Motion is purposeful. One well-orchestrated page load with staggered reveals creates more delight than scattered micro-interactions. Prioritize page transitions and hover states that surprise. Use CSS-only solutions for HTML, Motion library for React when available.

Match implementation complexity to the vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well, not from adding more.

**Never produce generic AI aesthetics** — the purple-on-white gradients, the card grids with rounded corners, the cookie-cutter layouts that lack context-specific character. No two interfaces should look the same. Vary between light and dark themes, different fonts, different aesthetics. If it looks like "AI made this," something failed.
</design_thinking>

## Config

`website.config.json` contains the site name, description, and URL — use it as the source of truth for site-wide values.