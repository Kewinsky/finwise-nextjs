'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Send,
  Bot,
  User,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  AlertTriangle,
  Sparkles,
  MessageCircle,
  BarChart3,
  Target,
  AlertCircle,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

// Mock data
const mockQuickQuestions = [
  'How can I save more money?',
  'What are my biggest expenses?',
  'How is my spending trending?',
  'Should I invest more?',
  "What's my financial health score?",
];

const mockInsights = {
  spendingInsights: [
    { category: 'Food & Dining', amount: 450, trend: 'up', percentage: 15 },
    { category: 'Transportation', amount: 320, trend: 'down', percentage: -8 },
    { category: 'Shopping', amount: 280, trend: 'up', percentage: 22 },
    { category: 'Utilities', amount: 150, trend: 'stable', percentage: 0 },
  ],
  savingsTips: [
    'Consider switching to a high-yield savings account to earn more interest',
    'Set up automatic transfers to your savings account on payday',
    'Review your subscriptions and cancel unused services',
    'Use cashback credit cards for everyday purchases',
  ],
  budgetOptimization: [
    'Your food budget is 20% over target - consider meal planning',
    'Transportation costs are well within budget - great job!',
    'Entertainment spending could be reduced by 15%',
    'Consider negotiating better rates for utilities',
  ],
  areasOfConcern: [
    'Credit card balance increased by 12% this month',
    'Emergency fund is below recommended 3-month expenses',
    'Investment allocation is too conservative for your age',
    'No retirement contributions this month',
  ],
};

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AssistantPage() {
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
  const [showInsights, setShowInsights] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `I understand you're asking about "${inputMessage}". Based on your financial data, here's what I can tell you: Your spending patterns show that you're doing well in most categories, but there are some areas for improvement. Would you like me to generate detailed insights about your finances?`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  const handleGenerateInsights = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setShowInsights(true);
      setIsLoading(false);
    }, 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
          <p className="text-muted-foreground">Get personalized financial insights and advice</p>
        </div>
        <Button onClick={handleGenerateInsights} disabled={isLoading}>
          <Sparkles className="mr-2 h-4 w-4" />
          {isLoading ? 'Generating...' : 'Generate Insights'}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chat Section */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Chat with AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.type === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.type === 'assistant' && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Bot className="h-4 w-4" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.type === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
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
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
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
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask me anything about your finances..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isLoading}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Questions Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Questions</CardTitle>
              <CardDescription>Click on any question to get instant insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockQuickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left h-auto p-3"
                    onClick={() => handleQuickQuestion(question)}
                  >
                    <span className="text-sm">{question}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Generated Insights */}
      {showInsights && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Your Financial Insights</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Spending Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Spending Insights
                </CardTitle>
                <CardDescription>Your spending patterns this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockInsights.spendingInsights.map((insight, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{insight.category}</p>
                        <p className="text-sm text-muted-foreground">
                          ${insight.amount} this month
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {insight.trend === 'up' && (
                          <TrendingUp className="h-4 w-4 text-red-500 dark:text-red-400" />
                        )}
                        {insight.trend === 'down' && (
                          <TrendingDown className="h-4 w-4 text-green-500 dark:text-green-400" />
                        )}
                        <Badge variant={insight.percentage > 0 ? 'destructive' : 'default'}>
                          {insight.percentage > 0 ? '+' : ''}
                          {insight.percentage}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Savings Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Savings Tips
                </CardTitle>
                <CardDescription>Personalized recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockInsights.savingsTips.map((tip, index) => (
                    <div key={index} className="flex gap-3">
                      <Lightbulb className="h-4 w-4 text-yellow-500 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Budget Optimization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Budget Optimization
                </CardTitle>
                <CardDescription>Areas to improve your budget</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockInsights.budgetOptimization.map((optimization, index) => (
                    <div key={index} className="flex gap-3">
                      <Target className="h-4 w-4 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{optimization}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Areas of Concern */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Areas of Concern
                </CardTitle>
                <CardDescription>Important financial alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockInsights.areasOfConcern.map((concern, index) => (
                    <div key={index} className="flex gap-3">
                      <AlertTriangle className="h-4 w-4 text-orange-500 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{concern}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
