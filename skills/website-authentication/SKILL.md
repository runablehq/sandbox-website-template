---
name: website-authentication
description: Implement Better Auth authentication for this stack, including server config, middleware, auth client, and sign-in/sign-up pages.
---

# Setup Authentication

We use [Better Auth](https://www.better-auth.com) for authentication.

Reference docs: [llms.txt](https://www.better-auth.com/llms.txt)

## 1. Authentication Config

Create `src/api/auth.ts`:

> **Port:** The local dev server port is defined in `website.config.json` (or provided by the agent runtime). Use `https://localhost:5178` as the default fallback for local development.

```ts
import { env } from "cloudflare:workers";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./database/schema";

const db = drizzle(env.DB, { schema });

export const createAuth = (baseURL: string) =>
  betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
    }),
    emailAndPassword: {
      enabled: true,
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL,
    trustedOrigins: async (request) => {
      const origin = request?.headers.get("origin");
      if (origin) return [origin];
      return [];
    },
  });

// Static export for CLI schema generation (uses the local dev server port)
export const auth = createAuth("https://localhost:5178");
```

## 2. Generate Auth Schema

Run from project root:

```bash
bun x @better-auth/cli@latest generate --config=./src/api/auth.ts --output=./src/api/database/auth-schema.ts -y
```

## 3. Middleware

Create `src/api/middleware/authentication.ts`:

```ts
import { createMiddleware } from "hono/factory";
import { createAuth } from "../auth";

const getBaseURL = (request: Request) => {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
};

// Attaches session and user if they are authenticated in the hono context.
export const authMiddleware = createMiddleware(async (c, next) => {
  const auth = createAuth(getBaseURL(c.req.raw));
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }
  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});

// Use this middleware to protect routes such as only authenticated users can access them.
export const authenticatedOnly = createMiddleware(async (c, next) => {
  const session = c.get("session");
  if (!session) {
    return c.json(
      {
        message: "You are not authenticated",
      },
      401,
    );
  }
  return next();
});
```

## 4. Auth Client

Create `src/web/lib/auth.ts`:

```ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  basePath: "/api/auth",
});
```

## 5. Authentication Pages

Add `src/web/pages/sign-in.tsx` and `src/web/pages/sign-up.tsx`.

Use the Better Auth client methods:
- Sign in: `authClient.signIn.email(...)`
- Sign up: `authClient.signUp.email(...)`

Design requirement:
- Do not ship barebones forms.
- Match the existing visual language of the app.
- Keep sign-in/sign-up pages intentionally designed, not generic boilerplate.

## 6. Routes

In `src/web/app.tsx` add:

```tsx
import SignIn from "./pages/sign-in";
import SignUp from "./pages/sign-up";

// Inside your Switch component:
<Route path="/sign-in" component={SignIn} />
<Route path="/sign-up" component={SignUp} />
```
