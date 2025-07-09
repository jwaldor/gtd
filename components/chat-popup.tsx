"use client";

import { useState } from "react";
import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle, Send, Bot, User, Loader2, X } from "lucide-react";
import { categories, getCategoryById } from "@/lib/types";

interface ToolResult {
  success: boolean;
  items?: Array<{
    id: string;
    text: string;
    category: string;
    createdAt: string;
    updatedAt?: string;
  }>;
  pagination?: {
    total: number;
    offset: number;
    limit: number;
    hasMore: boolean;
  };
}

export function ChatPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getCategoryBadge = (categoryId: string) => {
    const category = getCategoryById(categoryId);
    if (!category) return <Badge variant="outline">{categoryId}</Badge>;
    return <Badge className={category.color}>{category.name}</Badge>;
  };

  const renderToolResult = (toolResult: ToolResult) => {
    if (!toolResult.success || !toolResult.items) {
      return (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">Failed to retrieve items</p>
        </div>
      );
    }

    if (toolResult.items.length === 0) {
      return (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-gray-600">No items found matching your criteria.</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">
            Found {toolResult.items.length} item{toolResult.items.length !== 1 ? 's' : ''}
            {toolResult.pagination && ` (${toolResult.pagination.total} total)`}
          </p>
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {toolResult.items.map((item) => (
            <div key={item.id} className="p-3 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm flex-1">{item.text}</p>
                <div className="flex flex-col items-end gap-1">
                  {getCategoryBadge(item.category)}
                  <span className="text-xs text-gray-500">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              GTD Assistant
            </DialogTitle>
          </DialogHeader>

          {/* Chat Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">
                    Hi! I can help you search and manage your GTD tasks.
                    <br />
                    Try asking: "Show me my recent tasks" or "Find shopping items"
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0">
                      <Bot className="h-6 w-6 text-blue-600" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Render tool results */}
                    {message.toolInvocations?.map((toolInvocation) => (
                      <div key={toolInvocation.toolCallId} className="mt-3">
                        {toolInvocation.state === "result" && (
                          <div className="bg-white/90 p-3 rounded border">
                            {renderToolResult(toolInvocation.result as ToolResult)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {message.role === "user" && (
                    <div className="flex-shrink-0">
                      <User className="h-6 w-6 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <Bot className="h-6 w-6 text-blue-600" />
                  <div className="bg-gray-100 rounded-lg px-3 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Chat Input */}
          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about your tasks..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
