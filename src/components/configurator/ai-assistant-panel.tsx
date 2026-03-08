"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  buildCandidates,
  describeCoreBuild,
  detectIntent,
  getAssistantReply,
  isSameCoreBuild,
  type AssistantIntent,
  type Recommendation,
} from "@/lib/configurator/assistant";
import { cn, formatCurrency } from "@/lib/utils";
import { useConfigurationStore } from "@/store/configuration-store";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  recommendation?: Recommendation;
};

const suggestedPrompts: Array<{ label: string; intent: AssistantIntent }> = [
  { label: "Summarize my current build", intent: "summary" },
  { label: "Why are there warnings?", intent: "warnings" },
  { label: "Make it more sporty", intent: "sporty" },
  { label: "Help me lower the price", intent: "cheaper" },
];

function createMessageId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function AiAssistantPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const configuration = useConfigurationStore((state) => state.configuration);
  const currentStep = useConfigurationStore((state) => state.currentStep);
  const warnings = useConfigurationStore((state) => state.warnings);
  const ruleNotes = useConfigurationStore((state) => state.ruleNotes);
  const price = useConfigurationStore((state) => state.price);
  const isEvaluationPending = useConfigurationStore((state) => state.isEvaluationPending);
  const selectModel = useConfigurationStore((state) => state.selectModel);
  const selectEngine = useConfigurationStore((state) => state.selectEngine);
  const selectTransmission = useConfigurationStore((state) => state.selectTransmission);
  const selectTrim = useConfigurationStore((state) => state.selectTrim);
  const setCurrentStep = useConfigurationStore((state) => state.setCurrentStep);

  const assistantContext = useMemo(
    () => ({
      configuration,
      currentStep,
      warnings,
      ruleNotes,
      price,
      isEvaluationPending,
    }),
    [configuration, currentStep, warnings, ruleNotes, price, isEvaluationPending],
  );

  const candidates = useMemo(
    () => buildCandidates(configuration.market, configuration.dealer),
    [configuration.market, configuration.dealer],
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function handleSendMessage(text: string, intentOverride?: AssistantIntent) {
    if (!text.trim()) {
      return;
    }

    const userMessage: Message = {
      id: createMessageId("user"),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const intent = intentOverride ?? detectIntent(text);
    const reply = getAssistantReply(intent, assistantContext, candidates);

    await new Promise((resolve) => setTimeout(resolve, 300));

    const assistantMessage: Message = {
      id: createMessageId("assistant"),
      role: "assistant",
      content: reply.content,
      recommendation: reply.recommendation,
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
  }

  function applyRecommendation(recommendation: Recommendation) {
    if (isSameCoreBuild(configuration, recommendation.configuration)) {
      setCurrentStep(recommendation.focusStep);
      setMessages((prev) => [
        ...prev,
        {
          id: createMessageId("assistant"),
          role: "assistant",
          content:
            "Your current core build already matches that recommendation, so I left the rest of the configuration untouched and moved you forward to continue customizing.",
        },
      ]);

      return;
    }

    selectModel(recommendation.configuration.modelId);
    selectEngine(recommendation.configuration.engineId);
    selectTransmission(recommendation.configuration.transmissionId);
    selectTrim(recommendation.configuration.trimId);
    setCurrentStep(recommendation.focusStep);
    setMessages((prev) => [
      ...prev,
      {
        id: createMessageId("applied"),
        role: "assistant",
        content:
          "Recommendation applied as a fresh core build. You can keep customizing exterior, interior, wheels, and packages from here.",
      },
    ]);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-lg transition-all hover:from-cyan-600 hover:to-cyan-700 hover:shadow-xl",
          isOpen && "scale-95",
        )}
        title="AI Assistant"
      >
        {isOpen ? (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
          </svg>
        )}
      </button>

      {isOpen ? (
        <Card className="fixed bottom-24 right-4 z-50 flex h-[32rem] w-[calc(100vw-2rem)] max-w-sm flex-col border-slate-700 bg-slate-800 shadow-2xl sm:right-6">
          <div className="rounded-t-2xl bg-gradient-to-r from-cyan-600 to-cyan-500 p-4">
            <h3 className="font-semibold text-white">Configuration Assistant</h3>
            <p className="text-xs text-cyan-100">Context-aware guidance using your live build, rules, and pricing</p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="py-6 text-center text-slate-400">
                <p className="mb-4 text-sm">Ask for a summary, rule explanation, or a smarter recommendation.</p>
                <div className="space-y-2">
                  {suggestedPrompts.map((prompt) => (
                    <button
                      key={prompt.label}
                      type="button"
                      onClick={() => handleSendMessage(prompt.label, prompt.intent)}
                      className="w-full rounded-lg bg-slate-700 px-3 py-2 text-left text-xs text-slate-200 transition-colors hover:bg-slate-600"
                    >
                      {prompt.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {messages.map((message) => (
              <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                    message.role === "user" ? "rounded-br-none bg-cyan-600 text-white" : "rounded-bl-none bg-slate-700 text-slate-100",
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.role === "assistant" && message.recommendation ? (
                    <div className="mt-3 rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-cyan-200">
                        {message.recommendation.label}
                      </p>
                      <p className="mt-1 text-xs text-slate-200">
                        {describeCoreBuild(message.recommendation.configuration)}
                      </p>
                      <p className="mt-1 text-xs text-slate-300">
                        {formatCurrency(message.recommendation.estimatedPrice)} estimated total
                      </p>
                      <Button
                        size="sm"
                        className="mt-3 h-8 bg-cyan-500 px-3 text-xs text-slate-950 hover:bg-cyan-400"
                        onClick={() => applyRecommendation(message.recommendation!)}
                      >
                        Apply recommendation
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}

            {isLoading ? (
              <div className="flex justify-start">
                <div className="rounded-lg rounded-bl-none bg-slate-700 px-3 py-2">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:120ms]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:240ms]" />
                  </div>
                </div>
              </div>
            ) : null}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-slate-700 p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !isLoading) {
                    handleSendMessage(input);
                  }
                }}
                placeholder="Ask for summary, warnings, savings, or a smarter build..."
                disabled={isLoading}
                className="flex-1 rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
              />
              <Button size="sm" disabled={isLoading || !input.trim()} onClick={() => handleSendMessage(input)}>
                Send
              </Button>
            </div>
          </div>
        </Card>
      ) : null}
    </>
  );
}