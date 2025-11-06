'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content:
        "Hello! I'm your AI financial assistant. I can help you analyze your spending, provide savings tips, and answer questions about your finances. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    // Mock response - simulate API call
    setTimeout(() => {
      const mockResponses: Record<string, string> = {
        'how can i save more money?':
          'Based on your spending patterns, I recommend reviewing your recurring subscriptions and reducing dining out expenses. Consider setting up automatic transfers to your savings account.',
        'what are my biggest expenses?':
          'Your top spending categories this month are Food & Dining (30%), Transportation (20%), and Shopping (15%). Focus on these areas to reduce overall spending.',
        'how is my spending trending?':
          'Your spending has increased by 12% compared to last month. The main drivers are increased dining expenses and transportation costs. Consider setting monthly limits for these categories.',
        'should i invest more?':
          "Before increasing investments, ensure you have an emergency fund covering 3-6 months of expenses. Once that's established, consider investing 20% of your income.",
        "what's my financial health score?":
          "Your financial health score is calculated based on savings rate, expense-to-income ratio, and account diversity. I can generate detailed insights if you'd like!",
      };

      const lowerMessage = currentMessage.toLowerCase();
      const response =
        mockResponses[lowerMessage] ||
        `I understand you're asking about "${currentMessage}". Based on your financial data, I'd recommend reviewing your monthly spending patterns and setting clear savings goals. Would you like me to generate detailed insights?`;

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'assistant' && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground flex-shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
              {message.type === 'user' && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted flex-shrink-0">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground flex-shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-muted rounded-lg px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-2">
        <div className="flex gap-2">
          <Input
            placeholder="Ask me anything about your finances..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
