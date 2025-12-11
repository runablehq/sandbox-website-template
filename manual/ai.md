# Setup AI Agent

We are using the [AI SDK](https://v6.ai-sdk.dev/docs/foundations/overview) with OpenAI-compatible endpoints for building AI agents.

## Agent Config
Add the following agent config at `src/api/agent/index.ts` file.

```typescript
import { stepCountIs, SystemModelMessage, ToolLoopAgent } from "ai"
import dedent from 'dedent'
import { env } from "cloudflare:workers"
import { createOpenAI } from "@ai-sdk/openai"
import { calculate } from "./calculate-tool"

const openai = createOpenAI({
    baseURL: env.AI_GATEWAY_BASE_URL,
    apiKey: env.AI_GATEWAY_API_KEY
})

const INSTRUCTIONS: SystemModelMessage[] = [{
    role: "system",
    content: dedent`You are a helpful assistant. Your job is to support the user.`
}]

export const agent = new ToolLoopAgent({
    model: openai.chat("anthropic/claude-haiku-4.5"),
    instructions: INSTRUCTIONS,
    tools: {
        calculate,
    },
    stopWhen: [stepCountIs(100)]
})
```

## Tools
Add tools in the `src/api/agent/` directory. Here's an example calculator tool at `src/api/agent/calculate-tool.ts`:

```typescript
import z from "zod"
import { evaluate } from "mathjs"
import { tool } from "ai"

export const calculate = tool({
    description: "Calculate a mathematical expression.",
    inputSchema: z.object({
        expression: z.string().describe("The mathematical expression to calculate.")
    }),
    async execute({ expression }) {
        try {
            const result = evaluate(expression);
            return result
        } catch (error) {
            return String(error)
        }
    }
})
```

## API Routes
Add the agent routes to your API in `src/api/index.ts`:

```ts
import { agentRoutes } from './routes/agent';

app.route('/agent', agentRoutes)
```

Create the agent routes file at `src/api/routes/agent.ts`:

```ts
import { Hono } from "hono"
import { createAgentUIStreamResponse } from "ai"
import { agent } from '../agent'

export const agentRoutes = new Hono();

agentRoutes.post("/messages", async (c) => {
    const { messages } = await c.req.json();
    return createAgentUIStreamResponse({
        agent,
        messages,
    });
})
```

## Environment Variables
These environment variables are already present in `.env` and can be used directly.
- `AI_GATEWAY_BASE_URL`
- `AI_GATEWAY_API_KEY`
