# Setup Authentication

We are using [Better Auth](https://www.better-auth.com/llms.txt) for authentication. You can fetch and go through the docs whenever you want to customize or add something that's not documented below.

## Database Schema
1. Run the following command to setup database schema for the authentication from the project root.

`bun x @better-auth/cli@latest generate --config=./src/api/auth.ts --output=./src/api/db/auth.ts`

## Authentication Config
2. Add the following auth.ts config at `src/api/auth.ts` file.

```typescript
import { env } from "cloudflare:workers";
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './db/schema';
import { autumn } from "autumn-js/better-auth";

const db = drizzle(env.DB, { schema });

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    autumn()
  ],
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.VITE_BASE_URL,
});
```

## Middleware
Add the following middleware at `src/api/middleware/authentication.ts` file.
```ts
import { createMiddleware } from "hono/factory";
import { auth } from "../auth";

export const authMiddleware = createMiddleware(async (c, next) => {
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

export const authenticatedOnly = createMiddleware(
  async (c, next) => {
    const session = c.get("session");
    if (!session) {
      return c.json(
        {
          message: "You are not authenticated",
        },
        401
      );
    } else {
      return next();
    }
  }
);
```

## Auth Client
Add the following auth client at `src/web/lib/auth.ts` file.
```typescript
import { createAuthClient } from "better-auth/client"

export const authClient = createAuthClient({
    basePath: "/api/auth",
})
```

## Sign In Page
Add the following sign-in page at `src/web/pages/sign-in.tsx` file.
```tsx
import { useForm } from 'react-hook-form';
import { useLocation } from 'wouter';
import { authClient } from '../lib/auth';

interface SignInForm {
  email: string;
  password: string;
}

export default function SignIn() {
  const [, setLocation] = useLocation();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<SignInForm>();

  const onSubmit = async (data: SignInForm) => {
    const { error } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setError('root', { message: error.message || 'Sign in failed' });
      return;
    }

    setLocation('/');
  };

  return (
    <div>
      <h2>Sign In</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        {errors.root && <div>{errors.root.message}</div>}

        <div>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" {...register('email', { required: true })} />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input id="password" type="password" {...register('password', { required: true })} />
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>

        <div>
          <a href="/sign-up">Don't have an account? Sign up</a>
        </div>
      </form>
    </div>
  );
}
```

## Routes
Add the auth routes to your router in `src/web/app.tsx`:
```tsx
import SignIn from "./pages/sign-in";
import SignUp from "./pages/sign-up";

// Inside your Switch component:
<Route path="/sign-in" component={SignIn} />
<Route path="/sign-up" component={SignUp} />
```

## API Routes
Add the auth routes to your API in `src/api/index.ts`:
```ts
import { authRoutes } from './routes/auth';
import { authMiddleware } from './middleware/auth';

// Apply middleware before routes
app.use(authMiddleware)
app.route('/', authRoutes);
```

Create the auth routes file at `src/api/routes/auth.ts`:
```ts
import { Hono } from 'hono';
import { auth } from '../auth';

export const authRoutes = new Hono();

authRoutes.all('/auth/*', async (c) => {
  return auth.handler(c.req.raw);
});
```

## Sign Up Page
Add the following sign-up page at `src/web/pages/sign-up.tsx` file.
```tsx
import { useForm } from 'react-hook-form';
import { useLocation } from 'wouter';
import { authClient } from '../lib/auth';

interface SignUpForm {
  name: string;
  email: string;
  password: string;
}

export default function SignUp() {
  const [, setLocation] = useLocation();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<SignUpForm>();

  const onSubmit = async (data: SignUpForm) => {
    const { error } = await authClient.signUp.email({
      name: data.name,
      email: data.email,
      password: data.password,
    });

    if (error) {
      setError('root', { message: error.message || 'Sign up failed' });
      return;
    }

    setLocation('/');
  };

  return (
    <div>
      <h2>Sign Up</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        {errors.root && <div>{errors.root.message}</div>}

        <div>
          <label htmlFor="name">Name</label>
          <input id="name" type="text" {...register('name', { required: true })} />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" {...register('email', { required: true })} />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input id="password" type="password" {...register('password', { required: true })} />
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing up...' : 'Sign Up'}
        </button>

        <div>
          <a href="/sign-in">Already have an account? Sign in</a>
        </div>
      </form>
    </div>
  );
}
```

## Environment Variables
These environment variables are already present in `.env` and can be used directly.
- `BETTER_AUTH_SECRET`
- `VITE_BASE_URL`