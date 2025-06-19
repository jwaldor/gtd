# Items Services with AI SDK Tool Integration

This document explains the refactoring of the items API routes to use AI SDK tools, enabling both traditional API usage and AI chat interface integration.

## Overview

The original API routes in `app/api/items/route.ts` have been refactored to use services wrapped in AI SDK tool metadata. This allows the same business logic to be used in both:

1. **Traditional API routes** - HTTP endpoints that call the tool's `execute` function
2. **AI chat interfaces** - Where AI models can call these tools directly

## Files Created/Modified

### `lib/itemsServices.ts`
Contains four AI SDK tools for GTD item management:

- **`createItemTool`** - Creates new items with text and category
- **`updateItemTool`** - Updates existing items by ID
- **`deleteItemTool`** - Deletes items by ID  
- **`getItemsTool`** - Retrieves all items ordered by creation date

Each tool includes:
- Descriptive metadata for AI understanding
- Zod schema validation for parameters
- Execute function with the actual business logic
- Proper error handling

### `app/api/items/route.ts` (Modified)
Updated to use the tools from `itemsServices.ts`:
- Imports the four tools
- Calls `tool.execute()` instead of containing business logic directly
- Maintains the same HTTP response structure
- Preserves existing validation and error handling

### `lib/chatExample.ts` (Example)
Demonstrates how to use the tools in an AI chat interface:
- Shows integration with AI SDK's `generateText`
- Provides example usage scenarios
- Includes helper functions for direct tool usage

## Tool Structure

Each tool follows the AI SDK pattern:

```typescript
export const createItemTool = tool({
  description: 'Create a new GTD item with text and category',
  parameters: z.object({
    text: z.string().min(1, "Text is required").describe("The text content of the item"),
    category: z.string().min(1, "Category is required").describe("The category for organizing the item"),
  }),
  execute: async ({ text, category }) => {
    // Business logic here
    return result;
  },
});
```

## Usage Examples

### In API Routes (Current Usage)
```typescript
const result = await createItemTool.execute(
  { text: "Buy groceries", category: "shopping" },
  { toolCallId: "manual-call", messages: [] }
);
```

### In AI Chat Interface (Future Usage)
```typescript
const result = await generateText({
  model: yourModel,
  tools: itemsTools,
  prompt: "Create a task to buy groceries in the shopping category",
});
```

### Example Chat Interactions

1. **"Create a new task: Buy groceries in the shopping category"**
   - AI calls `createItemTool` with appropriate parameters

2. **"Show me all my tasks"**
   - AI calls `getItemsTool` to retrieve all items

3. **"Update task abc123 to say 'Buy organic groceries'"**
   - AI calls `updateItemTool` with ID and new text

4. **"Delete the task with ID abc123"**
   - AI calls `deleteItemTool` with the specified ID

## Benefits

1. **Code Reuse** - Same business logic works for both API routes and AI chat
2. **Type Safety** - Zod schemas provide runtime validation and TypeScript types
3. **AI Integration** - Tools can be easily used in chat interfaces
4. **Maintainability** - Business logic is centralized in one place
5. **Extensibility** - Easy to add new tools or modify existing ones

## Dependencies Added

- `ai` - AI SDK for tool definitions and chat integration

## Next Steps

To create a chat interface:

1. Set up an AI model provider (OpenAI, Anthropic, etc.)
2. Create a chat API route that uses `generateText` with `itemsTools`
3. Build a frontend chat component that can display tool results
4. Handle multi-step conversations where AI uses multiple tools

The foundation is now in place for both traditional API usage and advanced AI-powered task management through natural language.
