import { Hono } from 'hono';
import { authRoutes } from './routes/auth';
import { agentRoutes } from './routes/agent';
import { authMiddleware } from './middleware/auth';
import { cors } from "hono/cors"

const app = new Hono()
  .basePath('api');

app.use(cors({
  origin: "*"
}))

app.use(authMiddleware)
app.get('/ping', (c) => c.json({ message: `Pong! ${Date.now()}` }));
app.route('/', authRoutes);
app.route('/agent', agentRoutes)

export default app;