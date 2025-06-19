import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import { getItemsTool } from "@/lib/itemsServices";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  const result = streamText({
    model: openrouter.chat("anthropic/claude-4-sonnet"),
    messages,
    tools: {
      getItems: getItemsTool,
    },
    maxSteps: 2,
    system: `You are a helpful assistant for a GTD (Getting Things Done) task management system. 

You have access to a tool that can search and filter tasks. When users ask about their tasks, use the getItems tool to retrieve relevant information.

Key capabilities:
- Search tasks by text content using the 'search' parameter
- Filter tasks by category using the 'category' parameter  
- Sort tasks by date (newest/oldest first), category, or text
- Limit results for better readability

Available categories:
- essential-actionable-now: Essential Actionable Now
- actionable-now: Actionable Now  
- essential-not-actionable-now: Essential Not Actionable Now
- not-actionable-now: Not Actionable Now
- future: Future
- already-done: Already Done

When displaying task results:
- Show the task text clearly
- Include the category with a brief explanation
- Show creation date when relevant
- If there are many results, suggest ways to filter further
- Be conversational and helpful

Always call the tool first when users ask about tasks, then provide a helpful summary and analysis of the results.`,
  });

  return result.toDataStreamResponse();
}
