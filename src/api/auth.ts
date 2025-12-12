import { env } from "cloudflare:workers";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./db/schema";
import { autumn } from "autumn-js/better-auth";

const db = drizzle(env.DB, { schema });

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [autumn()],
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.VITE_BETTER_AUTH_URL,
});

