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

export type RecommendationIntent = "sporty" | "luxury" | "value" | "performance" | "cheaper";
export type AssistantIntent =
  | RecommendationIntent
  | "summary"
  | "warnings"
  | "incentives"
  | "next-step"
  | "help";

export type Recommendation = {
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

export type AssistantContext = {
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

export type BuildCandidate = EvaluatedBuild & {
  modelId: string;
  engineId: string;
  transmissionId: string;
  trimId: string;
};

export type AssistantReply = {
  content: string;
  recommendation?: Recommendation;
};

const DEFAULT_PAINT_OPTION_ID = "paint-pearl-white";

export function hasCompleteCoreSelection(configuration: Configuration) {
  return Boolean(
    configuration.modelId &&
      configuration.engineId &&
      configuration.transmissionId &&
      configuration.trimId,
  );
}

export function getMissingStep(configuration: Configuration): { label: string; step: number } | null {
  if (!configuration.modelId) return { label: "Model", step: 0 };
  if (!configuration.engineId) return { label: "Engine", step: 1 };
  if (!configuration.transmissionId) return { label: "Transmission", step: 2 };
  if (!configuration.trimId) return { label: "Trim", step: 3 };

  return null;
}

export function detectIntent(text: string): AssistantIntent {
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

export function buildCandidates(
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

export function describeCoreBuild(
  configuration: Pick<Configuration, "modelId" | "engineId" | "transmissionId" | "trimId">,
) {
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

export function getRecommendation(
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

export function getAssistantReply(
  intent: AssistantIntent,
  context: AssistantContext,
  candidates: BuildCandidate[],
): AssistantReply {
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

export function isSameCoreBuild(
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