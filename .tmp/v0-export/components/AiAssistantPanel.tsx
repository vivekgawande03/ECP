'use client';

import { useState, useRef, useEffect } from 'react';
import { useConfigurationStore } from '@/lib/configuration-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AiAssistantPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { configuration, selectModel, selectEngine, selectTransmission, selectTrim } =
    useConfigurationStore();

  const suggestedPrompts = [
    'Suggest a sporty configuration',
    'Find me the best value option',
    'Show me luxury features',
    'I want maximum performance',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateAiResponse = async (userMessage: string): Promise<string> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));

    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('sporty') || lowerMessage.includes('sport')) {
      return `Great choice! I'd recommend the Sedan X with a 3.0L Turbo Petrol engine and Sport trim. This gives you excellent performance (320hp) with sporty handling. Would you like me to apply this configuration?`;
    } else if (lowerMessage.includes('luxury') || lowerMessage.includes('premium')) {
      return `For a luxury experience, I suggest the SUV Elite with the Electric engine and Luxury trim. You'll get premium comfort, advanced technology, and eco-friendly performance. Shall I set this up for you?`;
    } else if (
      lowerMessage.includes('value') ||
      lowerMessage.includes('best price') ||
      lowerMessage.includes('affordable')
    ) {
      return `For the best value, I recommend the Sedan X with the 2.0L Petrol engine and Base trim. This offers great starting features while keeping costs down. Would you like to configure this?`;
    } else if (lowerMessage.includes('performance') || lowerMessage.includes('maximum')) {
      return `For maximum performance, the Coupe Sport with 3.0L Petrol Turbo and Electric engine options are your best bets. The Electric gives you 400hp with instant torque. Ready to try this configuration?`;
    } else {
      return `I can help you configure your perfect vehicle! Try asking me to suggest a sporty, luxury, value-oriented, or high-performance configuration. Or tell me your preferences and I'll recommend the best options for you.`;
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await simulateAiResponse(text);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyConfiguration = (type: string) => {
    if (type === 'sporty') {
      selectModel('sedan-x');
      setTimeout(() => selectEngine('petrol-3.0'), 100);
      setTimeout(() => selectTransmission('auto-10'), 200);
      setTimeout(() => selectTrim('sport'), 300);
    } else if (type === 'luxury') {
      selectModel('suv-elite');
      setTimeout(() => selectEngine('electric'), 100);
      setTimeout(() => selectTransmission('direct-drive'), 200);
      setTimeout(() => selectTrim('luxury'), 300);
    } else if (type === 'value') {
      selectModel('sedan-x');
      setTimeout(() => selectEngine('petrol-2.0'), 100);
      setTimeout(() => selectTransmission('manual'), 200);
      setTimeout(() => selectTrim('base'), 300);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50 text-white',
          isOpen && 'scale-95'
        )}
        title="AI Assistant"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
          </svg>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-96 h-96 bg-slate-800 border-slate-700 shadow-2xl flex flex-col z-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-600 to-cyan-500 p-4 rounded-t-lg">
            <h3 className="font-semibold text-white">Configuration Assistant</h3>
            <p className="text-xs text-cyan-100">AI-powered car recommendations</p>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-slate-400 py-8">
                <p className="text-sm mb-4">Hi! I can help you find the perfect car configuration.</p>
                <div className="space-y-2">
                  {suggestedPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      className="w-full text-left px-3 py-2 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-2',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-xs px-3 py-2 rounded-lg text-sm',
                    message.role === 'user'
                      ? 'bg-cyan-600 text-white rounded-br-none'
                      : 'bg-slate-700 text-slate-100 rounded-bl-none'
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2">
                <div className="bg-slate-700 px-3 py-2 rounded-lg rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-700 p-3 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isLoading) {
                    handleSendMessage(input);
                  }
                }}
                placeholder="Ask me anything..."
                className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSendMessage(input)}
                disabled={isLoading || !input.trim()}
                size="sm"
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                Send
              </Button>
            </div>
            <p className="text-xs text-slate-500">Try: "sporty", "luxury", or "best value"</p>
          </div>
        </Card>
      )}
    </>
  );
}
