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