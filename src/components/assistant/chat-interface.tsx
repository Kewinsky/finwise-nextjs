'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, AlertCircle, XCircle, Clock, Sparkles } from 'lucide-react';
import { UsageLimitModal } from './usage-limit-modal';
import { askAIQuestion } from '@/lib/actions/finance-actions';
import { notifyError } from '@/lib/notifications';
import type { AIUsageData } from '@/hooks/use-ai-usage';
import type { PlanType } from '@/config/app';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'error';
  content: string;
  timestamp: Date;
  errorType?: 'limit' | 'service' | 'rate-limit';
}

interface ChatInterfaceProps {
  usage: AIUsageData | null;
  canMakeQuery: boolean;
  isLimitReached: boolean;
  refetch: () => Promise<void>;
  planType?: PlanType;
}

const SUGGESTED_QUESTIONS = [
  'How much did I spend this month?',
  'What are my biggest expenses?',
  'How can I save more money?',
  "What's my current account balance?",
  'Show me my spending trends',
  'What categories am I spending the most on?',
  'Compare this month to last month',
  'Give me budgeting advice',
] as const;

export function ChatInterface({
  usage,
  canMakeQuery,
  isLimitReached,
  refetch,
  planType,
}: ChatInterfaceProps) {
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
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addErrorMessage = (errorType: 'limit' | 'service' | 'rate-limit') => {
    const errorMessages = {
      limit: {
        content:
          "You've reached your AI query limit (5/5 queries used this month).\n\nUpgrade to continue chatting with AI assistant.",
        action: 'Upgrade Plan',
      },
      service: {
        content: 'AI service is temporarily unavailable. Please try again in a moment.',
        action: 'Retry',
      },
      'rate-limit': {
        content: 'Too many requests. Please wait a moment before trying again.',
        action: 'OK',
      },
    };

    const errorMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'error',
      content: errorMessages[errorType].content,
      timestamp: new Date(),
      errorType,
    };

    setMessages((prev) => [...prev, errorMessage]);
  };

  const handleSuggestedQuestion = (question: string) => {
    setShowSuggestions(false);
    setInputMessage('');
    handleSendMessage(question);
  };

  const handleSendMessage = async (messageOverride?: string) => {
    const messageToSend = messageOverride || inputMessage;
    if (!messageToSend.trim() || isLoading) return;

    if (!canMakeQuery || isLimitReached) {
      setShowLimitModal(true);
      addErrorMessage('limit');
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentMessage = messageToSend;
    if (!messageOverride) {
      setInputMessage('');
    }
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('message', currentMessage);

      const result = await askAIQuestion(formData);

      if (!result.success) {
        if (result.error?.includes('limit')) {
          addErrorMessage('limit');
          setShowLimitModal(true);
        } else if (result.error?.includes('rate limit')) {
          addErrorMessage('rate-limit');
        } else {
          addErrorMessage('service');
        }
        setIsLoading(false);
        return;
      }

      if (!('data' in result) || !result.data) {
        addErrorMessage('service');
        setIsLoading(false);
        return;
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: result.data.answer,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      await refetch();
    } catch (error) {
      notifyError(error instanceof Error ? error.message : 'Failed to send message');
      addErrorMessage('service');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-full">
      {usage && (
        <UsageLimitModal
          open={showLimitModal}
          onOpenChange={setShowLimitModal}
          queryCount={usage.queryCount}
          limit={usage.limit}
          currentPlan={planType || 'free'}
        />
      )}

      <ScrollArea className="flex-1 p-2">
        <div className="space-y-4">
          {messages.map((message) => {
            if (message.type === 'error') {
              const errorIcon =
                message.errorType === 'limit' ? (
                  <AlertCircle className="h-4 w-4" />
                ) : message.errorType === 'rate-limit' ? (
                  <Clock className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                );

              return (
                <div key={message.id} className="flex gap-3 min-w-0 justify-start">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 text-destructive flex-shrink-0">
                    {errorIcon}
                  </div>
                  <div className="max-w-[80%] min-w-0 rounded-lg px-4 py-2 break-words bg-destructive/10 border border-destructive/20">
                    <p className="text-sm break-words whitespace-pre-wrap text-destructive">
                      {message.content}
                    </p>
                    {message.errorType === 'limit' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => setShowLimitModal(true)}
                      >
                        Upgrade Plan
                      </Button>
                    )}
                    {message.errorType === 'service' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => handleSendMessage()}
                      >
                        Retry
                      </Button>
                    )}
                    <p className="text-xs mt-1 text-destructive/70">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={message.id}
                className={`flex gap-3 min-w-0 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'assistant' && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground flex-shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] min-w-0 rounded-lg px-4 py-2 break-words ${
                    message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                >
                  <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.type === 'user'
                        ? 'text-primary-foreground/70'
                        : 'text-muted-foreground'
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
            );
          })}
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
          <Popover open={showSuggestions} onOpenChange={setShowSuggestions}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="flex-shrink-0"
                disabled={isLoading || !canMakeQuery}
                title="Suggested questions"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3" align="start" side="top">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  Suggested questions:
                </p>
                <div className="space-y-1.5">
                  {SUGGESTED_QUESTIONS.map((question, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs h-auto py-2 px-3 text-left whitespace-normal"
                      onClick={() => handleSuggestedQuestion(question)}
                      disabled={isLoading || !canMakeQuery}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Input
            placeholder="Ask me anything about your finances..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            disabled={isLoading || !canMakeQuery}
            className="flex-1"
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isLoading || !canMakeQuery}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
