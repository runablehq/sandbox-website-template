import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

interface CreateFullStackWranglerConfigOptions {
    name: string;
}

function createFullStackWranglerConfig({ name }: CreateFullStackWranglerConfigOptions) {
    return {
        $schema: "node_modules/wrangler/config-schema.json",
        name,
        compatibility_date: "2025-10-08",
        compatibility_flags: ["nodejs_compat"],
        main: "./src/api/index.ts",
        observability: { enabled: true },
        upload_source_maps: true,
        assets: {
            directory: "./dist/client",
            not_found_handling: "single-page-application",
            run_worker_first: ["/api/*"]
        },
        d1_databases: [{
            binding: "DB",
            database_name: name,
            database_id: "77a39bba-4f16-47e9-8be8-e52d28eb9083",
            migrations_dir: "src/api/migrations"
        }],
        r2_buckets: [{
            bucket_name: name,
            binding: "BUCKET"
        }]
    };
}

const DRIZZLE_CONFIG = `import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/api/db/schema.ts',
  out: './src/api/migrations',
  dialect: 'sqlite',
  driver: 'd1-http',
});`;

const DATABASE_SCHEMA = `import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('emailVerified', { mode: 'boolean' }).notNull(),
  image: text('image'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
});

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id),
});

export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: integer('accessTokenExpiresAt', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refreshTokenExpiresAt', { mode: 'timestamp' }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
});

export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }),
});`;

const BETTER_AUTH_CONFIG = `import { env } from "cloudflare:workers";
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './db/schema';

const db = drizzle(env.DB, { schema });

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
});
`;

const AUTH_ROUTES = `import { Hono } from 'hono';
import { auth } from '../auth';

const app = new Hono();

app.all('/auth/*', async (c) => {
  return auth.handler(c.req.raw);
});

app.get('/session', async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });
  
  if (!session) {
    return c.json({ user: null, session: null });
  }
  
  return c.json(session);
});

app.post('/signout', async (c) => {
  await auth.api.signOut({
    headers: c.req.raw.headers,
  });
  
  return c.json({ success: true });
});

export default app;`;

const API_INDEX = `import { Hono } from 'hono';
import authRoutes from './routes/auth';

const app = new Hono()
  .basePath('api');

app.get('/ping', (c) => c.json({ message: \`Pong! \${Date.now()}\` }));

app.route('/', authRoutes);

export default app;`;

const SIGNIN_PAGE = `import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Sign in failed');
      }

      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-center">Sign In</h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign in with Google
          </button>

          <div className="text-center">
            <a href="/signup" className="text-sm text-blue-600 hover:text-blue-500">
              Don't have an account? Sign up
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}`;

const SIGNUP_PAGE = `import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Sign up failed');
      }

      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-center">Sign Up</h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign up with Google
          </button>

          <div className="text-center">
            <a href="/signin" className="text-sm text-blue-600 hover:text-blue-500">
              Already have an account? Sign in
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}`;

const ENV_EXAMPLE = `# Better Auth - Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Better Auth - Configuration
BETTER_AUTH_SECRET=your_secret_key_min_32_chars
BETTER_AUTH_URL=http://localhost:5173
`;

const README = `# Full-Stack Setup

## Features
- Better-auth (email/password + Google OAuth)
- Drizzle ORM + D1 database
- Modern \`cloudflare:workers\` env pattern

## Quick Start

\`\`\`bash
# Install dependencies
bun install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Create D1 database
bunx wrangler d1 create <database-name>
# Update database_id in wrangler.json

# Generate types and migrations
bun cf-typegen
bun db:generate
bun db:migrate

# Start dev server
bun dev
\`\`\`

## Google OAuth Setup
1. [Google Cloud Console](https://console.cloud.google.com/) → Create project
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add redirect URI: \`http://localhost:5173/api/auth/google/callback\`

## API Endpoints
- \`POST /api/auth/signup\` - Sign up
- \`POST /api/auth/signin\` - Sign in
- \`GET /api/auth/google\` - Google OAuth
- \`GET /api/session\` - Get session
- \`POST /api/signout\` - Sign out

## Database Commands
\`\`\`bash
bun db:generate      # Generate migrations
bun db:migrate       # Apply locally
bun db:migrate:remote # Apply to production
bun db:studio        # Open Drizzle Studio
\`\`\`

## Deployment
\`\`\`bash
# Set production secrets
bunx wrangler secret put GOOGLE_CLIENT_ID
bunx wrangler secret put GOOGLE_CLIENT_SECRET
bunx wrangler secret put BETTER_AUTH_SECRET
bunx wrangler secret put BETTER_AUTH_URL

# Deploy
bun deploy
\`\`\`
`;

const GITIGNORE_ADDITIONS = `# Environment variables
.env
.env.local
.env.*.local

# Wrangler
.wrangler/

# Database
*.db
*.db-shm
*.db-wal`;

function createPackageJsonUpdates() {
    return {
        dependencies: {
            "better-auth": "^1.4.3",
            "drizzle-orm": "^0.44.7",
        },
        devDependencies: {
            "drizzle-kit": "^0.31.7",
        },
        scripts: {
            "db:generate": "drizzle-kit generate",
            "db:migrate": "wrangler d1 migrations apply DB --local",
            "db:migrate:remote": "wrangler d1 migrations apply DB --remote",
            "db:studio": "drizzle-kit studio",
        }
    };
}

async function ensureDir(dir: string) {
    if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
    }
}

async function main() {
    const projectRoot = process.cwd();
    const packageJsonPath = join(projectRoot, 'package.json');
    const wranglerJsonPath = join(projectRoot, 'wrangler.json');

    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
    const projectName = packageJson.name;

    console.log(`Configuring full-stack setup for ${projectName}`);

    // Update wrangler.json
    const wranglerConfig = createFullStackWranglerConfig({ name: projectName });
    await writeFile(wranglerJsonPath, JSON.stringify(wranglerConfig, null, 2));
    console.log('Updated wrangler.json');

    // Update package.json
    const updates = createPackageJsonUpdates();
    packageJson.dependencies = { ...packageJson.dependencies, ...updates.dependencies };
    packageJson.devDependencies = { ...packageJson.devDependencies, ...updates.devDependencies };
    packageJson.scripts = { ...packageJson.scripts, ...updates.scripts };
    await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('Updated package.json');

    // Create directory structure
    await ensureDir(join(projectRoot, 'src', 'api', 'db'));
    await ensureDir(join(projectRoot, 'src', 'api', 'routes'));
    await ensureDir(join(projectRoot, 'src', 'api', 'migrations'));
    await ensureDir(join(projectRoot, 'src', 'web', 'pages'));
    console.log('Created directory structure');

    // Create files
    await writeFile(join(projectRoot, 'src', 'api', 'db', 'schema.ts'), DATABASE_SCHEMA);
    await writeFile(join(projectRoot, 'drizzle.config.ts'), DRIZZLE_CONFIG);
    await writeFile(join(projectRoot, 'src', 'api', 'auth.ts'), BETTER_AUTH_CONFIG);
    await writeFile(join(projectRoot, 'src', 'api', 'routes', 'auth.ts'), AUTH_ROUTES);
    await writeFile(join(projectRoot, 'src', 'api', 'index.ts'), API_INDEX);
    await writeFile(join(projectRoot, '.env.example'), ENV_EXAMPLE);
    await writeFile(join(projectRoot, 'README.md'), README);
    await writeFile(join(projectRoot, 'src', 'web', 'pages', 'sign-in.tsx'), SIGNIN_PAGE);
    await writeFile(join(projectRoot, 'src', 'web', 'pages', 'sign-up.tsx'), SIGNUP_PAGE);
    console.log('Created auth and database files');
    console.log('Created sign-in and sign-up pages');
    console.log('Updated README.md');

    // Update .gitignore
    const gitignorePath = join(projectRoot, '.gitignore');
    const existingGitignore = existsSync(gitignorePath) 
        ? await readFile(gitignorePath, 'utf-8') 
        : '';
    
    if (!existingGitignore.includes('.env')) {
        await writeFile(gitignorePath, existingGitignore + GITIGNORE_ADDITIONS);
        console.log('Updated .gitignore');
    }

    console.log('Full-stack setup complete');
}

main().catch(console.error);