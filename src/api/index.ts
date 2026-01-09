import { Hono } from 'hono';
import { cors } from "hono/cors"
import { env } from "cloudflare:workers"

const app = new Hono()
  .basePath('api');

app.use(cors({
  origin: "*"
}))

app.get('/ping', (c) => c.json({ message: `Pong! ${Date.now()}` }));

app.get('/test-env', (c) => {
  console.log('cloudflare:workers env:', env);
  return c.json({ message: 'Check server logs for env output' });
});

export default app;