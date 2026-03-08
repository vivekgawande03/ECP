"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  engines,
  getDealerById,
  getEngineById,
  getMarketById,
  getModelById,
  getTransmissionById,
  getTrimById,
  models,
  transmissions,
  trims,
} from "@/lib/configurator/mock-data";
import { calculateConfigurationPrice } from "@/lib/configurator/pricing";
import { getRuleNotes, normalizeConfigurationWithRules } from "@/lib/configurator/rules";
import type {
  Configuration,
  PriceBreakdown,
  RuleNote,
  ValidationWarning,
} from "@/lib/configurator/types";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useConfigurationStore } from "@/store/configuration-store";

type RecommendationIntent = "sporty" | "luxury" | "value" | "performance" | "cheaper";
type AssistantIntent =
  | RecommendationIntent
  | "summary"
  | "warnings"
  | "incentives"
  | "next-step"
  | "help";

type Recommendation = {
  label: string;
  rationale: string;
  focusStep: number;
  estimatedPrice: number;
  priceDelta: number;
  configuration: {
    modelId: string;
    engineId: string;
    transmissionId: string;
    trimId: string;
  };
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  recommendation?: Recommendation;
};

type AssistantContext = {
  configuration: Configuration;
  currentStep: number;
  warnings: ValidationWarning[];
  ruleNotes: RuleNote[];
  price: PriceBreakdown;
  isEvaluationPending: boolean;
};

type EvaluatedBuild = {
  configuration: Configuration;
  warnings: ValidationWarning[];
  ruleNotes: RuleNote[];
  price: PriceBreakdown;
};

type BuildCandidate = EvaluatedBuild & {
  modelId: string;
  engineId: string;
  transmissionId: string;
  trimId: string;
};

const DEFAULT_PAINT_OPTION_ID = "paint-pearl-white";

const suggestedPrompts: Array<{ label: string; intent: AssistantIntent }> = [
  { label: "Summarize my current build", intent: "summary" },
  { label: "Why are there warnings?", intent: "warnings" },
  { label: "Make it more sporty", intent: "sporty" },
  { label: "Help me lower the price", intent: "cheaper" },
];

function createMessageId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function hasCompleteCoreSelection(configuration: Configuration) {
  return Boolean(
    configuration.modelId &&
      configuration.engineId &&
      configuration.transmissionId &&
      configuration.trimId,
  );
}

function getMissingStep(configuration: Configuration): { label: string; step: number } | null {
  if (!configuration.modelId) return { label: "Model", step: 0 };
  if (!configuration.engineId) return { label: "Engine", step: 1 };
  if (!configuration.transmissionId) return { label: "Transmission", step: 2 };
  if (!configuration.trimId) return { label: "Trim", step: 3 };

  return null;
}

function detectIntent(text: string): AssistantIntent {
  const lower = text.toLowerCase();

  if (
    lower.includes("warning") ||
    lower.includes("invalid") ||
    lower.includes("incompatible") ||
    lower.includes("conflict") ||
    lower.includes("issue") ||
    lower.includes("problem") ||
    lower.includes("why")
  ) {
    return "warnings";
  }

  if (
    lower.includes("cheap") ||
    lower.includes("cheaper") ||
    lower.includes("lower price") ||
    lower.includes("reduce") ||
    lower.includes("save money") ||
    lower.includes("budget")
  ) {
    return "cheaper";
  }

  if (lower.includes("value") || lower.includes("affordable") || lower.includes("best price")) {
    return "value";
  }

  if (lower.includes("luxury") || lower.includes("premium") || lower.includes("comfort")) {
    return "luxury";
  }

  if (lower.includes("sport")) return "sporty";

  if (
    lower.includes("performance") ||
    lower.includes("maximum") ||
    lower.includes("fastest") ||
    lower.includes("quick")
  ) {
    return "performance";
  }

  if (
    lower.includes("discount") ||
    lower.includes("incentive") ||
    lower.includes("offer") ||
    lower.includes("credit")
  ) {
    return "incentives";
  }

  if (
    lower.includes("next") ||
    lower.includes("what should i choose") ||
    lower.includes("what now") ||
    lower.includes("next step")
  ) {
    return "next-step";
  }

  if (
    lower.includes("summary") ||
    lower.includes("summarize") ||
    lower.includes("current build") ||
    lower.includes("what do i have") ||
    lower.includes("status")
  ) {
    return "summary";
  }

  return "help";
}

function createRecommendationBase(
  market: Configuration["market"],
  dealer: Configuration["dealer"],
): Configuration {
  return {
    market,
    dealer,
    modelId: null,
    engineId: null,
    transmissionId: null,
    trimId: null,
    exteriorOptions: [DEFAULT_PAINT_OPTION_ID],
    interiorOptions: [],
    wheels: null,
    packages: [],
  };
}

function evaluateBuild(configuration: Configuration): EvaluatedBuild {
  const normalized = normalizeConfigurationWithRules({
    ...configuration,
    exteriorOptions: [...configuration.exteriorOptions],
    interiorOptions: [...configuration.interiorOptions],
    packages: [...configuration.packages],
  });
  const nextConfiguration = normalized.configuration;

  return {
    configuration: nextConfiguration,
    warnings: normalized.warnings,
    ruleNotes: getRuleNotes(nextConfiguration),
    price: calculateConfigurationPrice(nextConfiguration),
  };
}

function buildCandidates(
  market: Configuration["market"],
  dealer: Configuration["dealer"],
): BuildCandidate[] {
  const base = createRecommendationBase(market, dealer);

  return models.flatMap((model) =>
    engines
      .filter((engine) => engine.compatibleModels.includes(model.id))
      .flatMap((engine) =>
        transmissions
          .filter((transmission) => transmission.compatibleEngines.includes(engine.id))
          .flatMap((transmission) =>
            trims
              .filter((trim) => trim.compatibleEngines.includes(engine.id))
              .map((trim) => {
                const evaluated = evaluateBuild({
                  ...base,
                  modelId: model.id,
                  engineId: engine.id,
                  transmissionId: transmission.id,
                  trimId: trim.id,
                });

                if (
                  !evaluated.configuration.modelId ||
                  !evaluated.configuration.engineId ||
                  !evaluated.configuration.transmissionId ||
                  !evaluated.configuration.trimId ||
                  evaluated.warnings.some((warning) => warning.severity === "error")
                ) {
                  return null;
                }

                return {
                  ...evaluated,
                  modelId: model.id,
                  engineId: engine.id,
                  transmissionId: transmission.id,
                  trimId: trim.id,
                } satisfies BuildCandidate;
              })
              .filter((candidate): candidate is BuildCandidate => candidate !== null),
          ),
      ),
  );
}

function describeCoreBuild(configuration: Pick<Configuration, "modelId" | "engineId" | "transmissionId" | "trimId">) {
  return [
    configuration.modelId ? getModelById(configuration.modelId)?.name : null,
    configuration.engineId ? getEngineById(configuration.engineId)?.name : null,
    configuration.transmissionId ? getTransmissionById(configuration.transmissionId)?.name : null,
    configuration.trimId ? `${getTrimById(configuration.trimId)?.name} trim` : null,
  ]
    .filter(Boolean)
    .join(", ");
}

function getComparisonText(priceDelta: number, canCompare: boolean) {
  if (!canCompare) {
    return "";
  }

  if (priceDelta === 0) {
    return " It lands at essentially the same total as your current core build.";
  }

  if (priceDelta < 0) {
    return ` It saves about ${formatCurrency(Math.abs(priceDelta))} versus your current estimate.`;
  }

  return ` It adds about ${formatCurrency(priceDelta)} versus your current estimate.`;
}

function selectBestCandidate(
  candidates: BuildCandidate[],
  scorer: (candidate: BuildCandidate) => number,
) {
  return [...candidates].sort((left, right) => scorer(right) - scorer(left))[0] ?? null;
}

function toRecommendation(
  candidate: BuildCandidate,
  label: string,
  rationale: string,
  currentPrice: PriceBreakdown,
  canCompare: boolean,
): Recommendation {
  const incentiveNote =
    candidate.price.dealerDiscount > 0 && candidate.price.dealerDiscountLabel
      ? `${candidate.price.dealerDiscountLabel} is already reflected in the estimate.`
      : "";

  return {
    label,
    rationale: [rationale, incentiveNote].filter(Boolean).join(" "),
    focusStep: 4,
    estimatedPrice: candidate.price.totalPrice,
    priceDelta: canCompare ? candidate.price.totalPrice - currentPrice.totalPrice : 0,
    configuration: {
      modelId: candidate.modelId,
      engineId: candidate.engineId,
      transmissionId: candidate.transmissionId,
      trimId: candidate.trimId,
    },
  };
}

function getRecommendation(
  intent: RecommendationIntent,
  context: AssistantContext,
  candidates: BuildCandidate[],
): Recommendation | null {
  if (candidates.length === 0) {
    return null;
  }

  const canCompare = hasCompleteCoreSelection(context.configuration);
  const preferredModelId = context.configuration.modelId;

  if (intent === "cheaper") {
    const sameModelCandidates = preferredModelId
      ? candidates.filter((candidate) => candidate.modelId === preferredModelId)
      : [];
    const pool = sameModelCandidates.length > 0 ? sameModelCandidates : candidates;
    const candidate = [...pool].sort((left, right) => left.price.totalPrice - right.price.totalPrice)[0];

    return candidate
      ? toRecommendation(
          candidate,
          sameModelCandidates.length > 0 ? "Lower-cost version of this model" : "Lowest-cost valid starting point",
          sameModelCandidates.length > 0
            ? "I kept your current model and selected the least expensive compatible engine, transmission, and trim."
            : "This is the most affordable valid core build in the current market and dealer context.",
          context.price,
          canCompare,
        )
      : null;
  }

  if (intent === "value") {
    const candidate = selectBestCandidate(candidates, (current) => {
      const power = getEngineById(current.engineId)?.horsePower ?? 0;
      const trimBonus = current.trimId === "sport" ? 28 : current.trimId === "base" ? 22 : 18;
      const modelBonus = current.modelId === preferredModelId ? 18 : current.modelId === "sedan-x" ? 14 : 8;

      return power / 4 + trimBonus + modelBonus - current.price.totalPrice / 2500;
    });

    return candidate
      ? toRecommendation(
          candidate,
          "Best value recommendation",
          "This balances price, usable performance, and trim content instead of just chasing the absolute lowest sticker.",
          context.price,
          canCompare,
        )
      : null;
  }

  if (intent === "sporty") {
    const candidate = selectBestCandidate(candidates, (current) => {
      const horsePower = getEngineById(current.engineId)?.horsePower ?? 0;
      const modelBonus = current.modelId === "coupe-sport" ? 80 : current.modelId === "sedan-x" ? 48 : 18;
      const trimBonus = current.trimId === "sport" ? 70 : current.trimId === "luxury" ? 18 : 4;
      const engineBonus = current.engineId === "petrol-3.0" ? 55 : current.engineId === "electric" ? 32 : 8;
      const transmissionBonus =
        current.transmissionId === "auto-10"
          ? 24
          : current.transmissionId === "manual"
            ? 20
            : current.transmissionId === "direct-drive"
              ? 14
              : 8;

      return modelBonus + trimBonus + engineBonus + transmissionBonus + horsePower / 5 - current.price.totalPrice / 3500;
    });

    return candidate
      ? toRecommendation(
          candidate,
          "Sport-focused setup",
          "I prioritized sharper chassis choices, stronger powertrains, and driver-oriented trims.",
          context.price,
          canCompare,
        )
      : null;
  }

  if (intent === "luxury") {
    const candidate = selectBestCandidate(candidates, (current) => {
      const trimBonus = current.trimId === "luxury" ? 90 : current.trimId === "sport" ? 20 : 0;
      const modelBonus = current.modelId === "suv-elite" ? 42 : current.modelId === "sedan-x" ? 26 : 12;
      const engineBonus = current.engineId === "electric" ? 32 : current.engineId === "petrol-3.0" ? 18 : 4;
      const incentiveBonus = current.price.dealerDiscount > 0 ? 18 : 0;

      return trimBonus + modelBonus + engineBonus + incentiveBonus - current.price.totalPrice / 5000;
    });

    return candidate
      ? toRecommendation(
          candidate,
          "Luxury-first setup",
          "I biased toward premium trim content, quieter powertrains, and dealer-backed comfort upsell combinations.",
          context.price,
          canCompare,
        )
      : null;
  }

  const candidate = selectBestCandidate(candidates, (current) => {
    const horsePower = getEngineById(current.engineId)?.horsePower ?? 0;
    const modelBonus = current.modelId === "coupe-sport" ? 54 : current.modelId === "sedan-x" ? 18 : 10;
    const engineBonus = current.engineId === "electric" ? 38 : current.engineId === "petrol-3.0" ? 28 : 0;
    const transmissionBonus =
      current.transmissionId === "direct-drive"
        ? 24
        : current.transmissionId === "auto-10"
          ? 20
          : 6;
    const trimBonus = current.trimId === "luxury" ? 20 : current.trimId === "sport" ? 14 : 0;

    return horsePower / 3 + modelBonus + engineBonus + transmissionBonus + trimBonus - current.price.totalPrice / 7000;
  });

  return candidate
    ? toRecommendation(
        candidate,
        "Maximum-performance setup",
        "I weighted raw output and the strongest transmission pairing ahead of budget sensitivity.",
        context.price,
        canCompare,
      )
    : null;
}

function getSummaryResponse(context: AssistantContext) {
  const marketName = getMarketById(context.configuration.market)?.name ?? context.configuration.market;
  const dealerName = getDealerById(context.configuration.dealer)?.name ?? context.configuration.dealer;
  const buildSummary = describeCoreBuild(context.configuration);
  const missingStep = getMissingStep(context.configuration);
  const warningCount = context.warnings.length;
  const highlightNote = context.ruleNotes[0];

  if (!buildSummary) {
    return `You’re configuring for ${marketName} with ${dealerName}. Start by choosing a model, then I can recommend sporty, luxury, value, or performance directions based on the exact rules and pricing.`;
  }

  const priceText = context.isEvaluationPending
    ? "I’m still refreshing the latest rule and pricing snapshot."
    : `Current estimated total is ${formatCurrency(context.price.totalPrice)}.`;
  const nextText = missingStep
    ? ` Next required choice is ${missingStep.label}.`
    : " Your core build is complete, so you can fine-tune exterior, interior, wheels, and packages now.";
  const warningText = warningCount
    ? ` I also see ${warningCount} active warning${warningCount > 1 ? "s" : ""}.`
    : "";
  const noteText = highlightNote ? ` ${highlightNote.title}: ${highlightNote.detail}` : "";

  return `You currently have ${buildSummary}. ${priceText}${warningText}${nextText}${noteText}`;
}

function getWarningsResponse(context: AssistantContext) {
  const pendingText = context.isEvaluationPending
    ? "I’m still refreshing the latest evaluation, so this may tighten up in a moment. "
    : "";

  if (context.warnings.length > 0) {
    const warningDetails = context.warnings
      .slice(0, 2)
      .map((warning) => warning.message)
      .join(" ");

    return `${pendingText}I found ${context.warnings.length} active warning${context.warnings.length > 1 ? "s" : ""}. ${warningDetails}`;
  }

  const ruleWarnings = context.ruleNotes.filter((note) => note.tone === "warning");
  if (ruleWarnings.length > 0) {
    return `${pendingText}There are no active removals right now, but these rules still matter: ${ruleWarnings
      .slice(0, 2)
      .map((note) => `${note.title} — ${note.detail}`)
      .join(" ")}`;
  }

  return `${pendingText}Your current build has no active conflicts. If you want, I can still suggest a cheaper or sportier direction from here.`;
}

function getIncentivesResponse(context: AssistantContext) {
  if (context.price.dealerDiscount > 0 && context.price.dealerDiscountLabel) {
    return `You already have ${context.price.dealerDiscountLabel} applied for ${formatCurrency(context.price.dealerDiscount)} off the total.`;
  }

  const dealerPreview = context.ruleNotes.find((note) => note.id.includes("preview") || note.tone === "info");
  if (dealerPreview) {
    return `${dealerPreview.title}: ${dealerPreview.detail}`;
  }

  return "There is no automatic dealer incentive on the current configuration, but I can look for a luxury, EV, or value-oriented setup that may unlock one.";
}

function getNextStepResponse(context: AssistantContext) {
  const missingStep = getMissingStep(context.configuration);
  if (missingStep) {
    return `Next required step is ${missingStep.label}. Once that’s selected, I can compare cheaper, sportier, or more premium directions using real pricing and rule checks.`;
  }

  if (context.warnings.length > 0) {
    return "Your core selections are in place. I’d address the active warnings first, then continue with exterior, interior, wheels, or packages.";
  }

  if (context.currentStep < 4) {
    return "Your core selections are almost locked. Finish the trim choice, then you can move into exterior and interior personalization.";
  }

  return "Your build is in a good place. From here, I’d either personalize appearance and packages, or ask me for a cheaper, sportier, or more luxurious alternative.";
}

function buildRecommendationResponse(
  intent: RecommendationIntent,
  recommendation: Recommendation,
  context: AssistantContext,
) {
  const buildSummary = describeCoreBuild(recommendation.configuration);
  const estimateText = `Estimated total is ${formatCurrency(recommendation.estimatedPrice)}.`;
  const comparisonText = getComparisonText(
    recommendation.priceDelta,
    hasCompleteCoreSelection(context.configuration),
  );

  if (intent === "cheaper") {
    return `I found a lower-cost valid direction: ${buildSummary}. ${estimateText}${comparisonText} ${recommendation.rationale}`;
  }

  if (intent === "value") {
    return `My best value recommendation is ${buildSummary}. ${estimateText}${comparisonText} ${recommendation.rationale}`;
  }

  if (intent === "sporty") {
    return `For a sportier direction, I’d move you to ${buildSummary}. ${estimateText}${comparisonText} ${recommendation.rationale}`;
  }

  if (intent === "luxury") {
    return `For a more premium feel, I’d recommend ${buildSummary}. ${estimateText}${comparisonText} ${recommendation.rationale}`;
  }

  return `If maximum performance is the goal, I’d recommend ${buildSummary}. ${estimateText}${comparisonText} ${recommendation.rationale}`;
}

function getAssistantReply(
  intent: AssistantIntent,
  context: AssistantContext,
  candidates: BuildCandidate[],
): Pick<Message, "content" | "recommendation"> {
  if (
    intent === "cheaper" ||
    intent === "value" ||
    intent === "sporty" ||
    intent === "luxury" ||
    intent === "performance"
  ) {
    const recommendation = getRecommendation(intent, context, candidates);

    if (!recommendation) {
      return {
        content:
          "I couldn’t build a confident recommendation yet. Choose at least a market or dealer context, and I’ll recompute the best valid options.",
      };
    }

    return {
      content: buildRecommendationResponse(intent, recommendation, context),
      recommendation,
    };
  }

  if (intent === "summary") {
    return { content: getSummaryResponse(context) };
  }

  if (intent === "warnings") {
    return { content: getWarningsResponse(context) };
  }

  if (intent === "incentives") {
    return { content: getIncentivesResponse(context) };
  }

  if (intent === "next-step") {
    return { content: getNextStepResponse(context) };
  }

  return {
    content:
      "I can summarize your current build, explain warnings, surface dealer incentives, suggest the next step, or recommend sporty, luxury, value, performance, and cheaper directions using the live configurator state.",
  };
}

function isSameCoreBuild(
  left: Pick<Configuration, "modelId" | "engineId" | "transmissionId" | "trimId">,
  right: Pick<Configuration, "modelId" | "engineId" | "transmissionId" | "trimId">,
) {
  return (
    left.modelId === right.modelId &&
    left.engineId === right.engineId &&
    left.transmissionId === right.transmissionId &&
    left.trimId === right.trimId
  );
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