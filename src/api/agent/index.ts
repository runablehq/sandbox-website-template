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
