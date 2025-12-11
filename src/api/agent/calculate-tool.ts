
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

