# Website

React + Vite + Hono + Tailwind + Cloudflare Workers

## Scripts
- `bun run check` — Run before committing to verify types, build, and deployment config
- `bun run cf-typegen` — Run after modifying Cloudflare bindings to regenerate types

## Quick Start

```bash
# Install dependencies
bun install

# Create D1 database (replace <name> with your project name)
bunx wrangler d1 create <name>
# Copy the database_id from output to wrangler.json

# Configure environment
cp .env.example .env
# Edit .env with your credentials

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

## Authentication

This project uses [Better Auth](https://better-auth.com/) with email/password and Google OAuth.

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project and enable Google+ API
3. Create OAuth 2.0 credentials (Web application)
4. Add redirect URI: `http://localhost:5173/api/auth/google/callback`
5. Copy Client ID and Secret to `.env`

### Auth Endpoints
- `POST /api/auth/signup` — Create account
- `POST /api/auth/signin` — Sign in
- `GET /api/auth/google` — Google OAuth flow
- `GET /api/session` — Get current session
- `POST /api/signout` — Sign out

## Database

Uses [Drizzle ORM](https://orm.drizzle.team/) with Cloudflare D1.

```bash
bun db:generate       # Generate migrations from schema
bun db:migrate        # Apply migrations locally
bun db:migrate:remote # Apply migrations to production
bun db:studio         # Open Drizzle Studio
```

Schema is in `src/api/db/schema.ts`, migrations in `src/api/migrations/`.

## Deployment

```bash
# Set production secrets
bunx wrangler secret put GOOGLE_CLIENT_ID
bunx wrangler secret put GOOGLE_CLIENT_SECRET
bunx wrangler secret put BETTER_AUTH_SECRET
bunx wrangler secret put BETTER_AUTH_URL

# Run migrations on production
bun db:migrate:remote

# Deploy
bun deploy
```

## Coding Style

- Functional programming preferred (use `const`, avoid `let`)
- Extract types into separate interfaces
- No explicit return types unless necessary
- Prefer early returns to reduce nesting
- Use switch statements or key-value maps instead of nested if statements
- Keep code simple—minimize complex state and prop drilling
- Use existing libraries over custom implementations
- Prefer built-in Node modules over custom utils
- Write tests for complex functionality