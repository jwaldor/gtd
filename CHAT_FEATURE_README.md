# GTD Chat Assistant

This document describes the AI-powered chat assistant feature that allows users to interact with their GTD tasks using natural language.

## Overview

The chat assistant is a popup interface accessible via a floating button in the bottom-right corner of the application. It uses OpenRouter with Claude-3.5-Sonnet to provide intelligent task management capabilities.

## Features

### 🤖 **AI-Powered Task Search**
- Natural language queries to find tasks
- Intelligent filtering and sorting
- Contextual responses with task analysis

### 🔍 **Search Capabilities**
- Text-based search across all task content
- Category-based filtering
- Date-based sorting (newest/oldest first)
- Alphabetical sorting by text or category

### 💬 **Conversational Interface**
- Two-step conversation flow (tool call + analysis)
- Rich display of task results
- Contextual follow-up suggestions

## Implementation Details

### **Files Created/Modified**

#### `app/api/chat/route.ts`
- Chat API endpoint using Vercel AI SDK
- OpenRouter integration with Claude-3.5-Sonnet
- Tool integration with `getItemsTool`
- `maxSteps: 2` for tool call + response pattern

#### `components/chat-popup.tsx`
- Floating chat button (bottom-right corner)
- Modal dialog with chat interface
- Rich tool result rendering
- Responsive design with scroll areas

#### `app/layout.tsx`
- Added `<ChatPopup />` component to global layout

#### `.env`
- Added `OPENROUTER_API_KEY` environment variable

### **Dependencies Added**
- `@openrouter/ai-sdk-provider` - OpenRouter integration for AI SDK

## Usage Examples

### **Example Conversations**

1. **"Show me all my tasks"**
   - AI calls `getItemsTool` with no filters
   - Displays all tasks with categories and dates
   - Provides summary and organization suggestions

2. **"Find my shopping tasks"**
   - AI calls `getItemsTool` with `category: "actionable-now"` (or appropriate category)
   - Shows filtered results
   - Suggests related actions

3. **"What are my most recent tasks?"**
   - AI calls `getItemsTool` with `sortBy: "date-desc"` and `limit: 10`
   - Displays recent tasks chronologically
   - Provides insights on recent activity

4. **"Find tasks about groceries"**
   - AI calls `getItemsTool` with `search: "groceries"`
   - Shows matching tasks across all categories
   - Suggests organization or completion actions

### **Tool Result Display**

The chat interface provides rich visualization of task results:

- **Task Cards**: Each task displayed in a clean card format
- **Category Badges**: Color-coded category indicators
- **Timestamps**: Creation dates for context
- **Pagination Info**: Shows result counts and totals
- **Empty States**: Helpful messages when no tasks found

## Technical Architecture

### **AI SDK Integration**
```typescript
const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
  api: "/api/chat",
});
```

### **Tool Configuration**
```typescript
tools: {
  getItems: getItemsTool,
},
maxSteps: 2,
```

### **OpenRouter Setup**
```typescript
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

model: openrouter.chat("anthropic/claude-3.5-sonnet")
```

## Setup Instructions

1. **Get OpenRouter API Key**
   - Visit [OpenRouter](https://openrouter.ai/keys)
   - Create an account and generate an API key

2. **Configure Environment**
   ```bash
   # Add to .env file
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

3. **Test the Feature**
   - Look for the floating chat button (💬) in bottom-right corner
   - Click to open the chat interface
   - Try example queries like "Show me my tasks"

## Available GTD Categories

The AI assistant understands these task categories:

- **essential-actionable-now**: Essential Actionable Now
- **actionable-now**: Actionable Now  
- **essential-not-actionable-now**: Essential Not Actionable Now
- **not-actionable-now**: Not Actionable Now
- **future**: Future
- **already-done**: Already Done

## Benefits

1. **Natural Language Interface**: No need to learn complex filtering syntax
2. **Intelligent Analysis**: AI provides insights and suggestions
3. **Quick Access**: Always available via floating button
4. **Rich Results**: Visual task cards with full context
5. **Conversational Flow**: Follow-up questions and clarifications

## Future Enhancements

Potential improvements for the chat assistant:

- **Task Creation**: Allow creating new tasks via chat
- **Task Updates**: Modify existing tasks through conversation
- **Smart Suggestions**: Proactive task organization recommendations
- **Voice Input**: Speech-to-text for hands-free interaction
- **Export Options**: Generate reports or summaries via chat

The chat assistant provides a modern, AI-powered interface for GTD task management while maintaining the robust filtering and organization capabilities of the underlying system.
