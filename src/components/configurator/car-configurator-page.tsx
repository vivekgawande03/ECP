"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AiAssistantPanel } from "@/components/configurator/ai-assistant-panel";
import { ConfigurationContextCard } from "@/components/configurator/configuration-context-card";
import { RuleExplanationPanel } from "@/components/configurator/rule-explanation-panel";
import { ConfiguratorLayout } from "@/components/configurator/configurator-layout";
import { StepWizard } from "@/components/configurator/step-wizard";
import { VehiclePreview } from "@/components/configurator/vehicle-preview";
import { EngineStep } from "@/components/configurator/steps/engine-step";
import { ExteriorStep } from "@/components/configurator/steps/exterior-step";
import { InteriorStep } from "@/components/configurator/steps/interior-step";
import { ModelStep } from "@/components/configurator/steps/model-step";
import { PackagesStep } from "@/components/configurator/steps/packages-step";
import { ReviewStep } from "@/components/configurator/steps/review-step";
import { TransmissionStep } from "@/components/configurator/steps/transmission-step";
import { TrimStep } from "@/components/configurator/steps/trim-step";
import { WheelsStep } from "@/components/configurator/steps/wheels-step";
import { Button } from "@/components/ui/button";
import { getDealerById, getMarketById } from "@/lib/configurator/mock-data";
import type { SavedQuote } from "@/lib/configurator/types";
import {
  areConfigurationVersionsEqual,
  getConfigurationVersionEntries,
} from "@/lib/configurator/versioning";
import { formatCurrency } from "@/lib/utils";
import { useConfigurationStore } from "@/store/configuration-store";
import { trpc } from "@/trpc/react";

const steps = [
  { label: "Model", content: <ModelStep /> },
  { label: "Engine", content: <EngineStep /> },
  { label: "Transmission", content: <TransmissionStep /> },
  { label: "Trim", content: <TrimStep /> },
  { label: "Exterior", content: <ExteriorStep /> },
  { label: "Interior", content: <InteriorStep /> },
  { label: "Wheels", content: <WheelsStep /> },
  { label: "Packages", content: <PackagesStep /> },
  { label: "Review", content: <ReviewStep /> },
];

export function CarConfiguratorPage() {
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedQuote, setCompletedQuote] = useState<SavedQuote | null>(null);

  useEffect(() => {
    void useConfigurationStore.persist.rehydrate();
  }, []);

  const configuration = useConfigurationStore((state) => state.configuration);
  const currentVersions = useConfigurationStore((state) => state.currentVersions);
  const reset = useConfigurationStore((state) => state.reset);
  const activeQuoteId = useConfigurationStore((state) => state.activeQuoteId);
  const setActiveQuoteId = useConfigurationStore((state) => state.setActiveQuoteId);
  const applySavedQuote = useConfigurationStore((state) => state.applySavedQuote);
  const applyEvaluation = useConfigurationStore((state) => state.applyEvaluation);
  const setEvaluationPending = useConfigurationStore((state) => state.setEvaluationPending);
  const utils = trpc.useUtils();
  const evaluationQuery = trpc.configuration.evaluate.useQuery(
    { configuration },
    {
      placeholderData: (previousData) => previousData,
    },
  );
  const activeQuoteQuery = trpc.quote.getById.useQuery(
    { id: activeQuoteId ?? "" },
    {
      enabled: Boolean(activeQuoteId),
    },
  );
  const latestQuoteQuery = trpc.quote.getLatest.useQuery();
  const createQuoteMutation = trpc.quote.create.useMutation();
  const activeQuote = completedQuote ?? activeQuoteQuery.data ?? null;
  const quoteMarket = activeQuote ? getMarketById(activeQuote.market) : null;
  const quoteDealer = activeQuote ? getDealerById(activeQuote.dealer) : null;
  const activeQuoteIsCurrent = activeQuote
    ? areConfigurationVersionsEqual(activeQuote.versions, currentVersions)
    : true;

  useEffect(() => {
    if (evaluationQuery.data) {
      applyEvaluation(evaluationQuery.data);
    }
  }, [applyEvaluation, evaluationQuery.data]);

  useEffect(() => {
    setEvaluationPending(evaluationQuery.isFetching);
  }, [evaluationQuery.isFetching, setEvaluationPending]);

  const handleComplete = async () => {
    try {
      if (!activeQuoteId) {
        const quote = await createQuoteMutation.mutateAsync({ configuration });

        setActiveQuoteId(quote.id);
        setCompletedQuote(quote);
        setIsCompleted(true);

        void utils.quote.list.invalidate();
        void utils.quote.getLatest.invalidate();
        void utils.quote.getById.invalidate({ id: quote.id });

        return;
      }

      setCompletedQuote(activeQuoteQuery.data ?? null);
      setIsCompleted(true);
    } catch {
      setCompletedQuote(null);
    }
  };

  const isLoadingCompletionQuote = isCompleted && Boolean(activeQuoteId) && activeQuoteQuery.isLoading && !activeQuote;

  if (isCompleted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 px-4">
        <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-center shadow-2xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
            <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">
            {isLoadingCompletionQuote
              ? "Loading Quote Details"
              : activeQuote
                ? "Quote Saved Successfully"
                : "Configuration Complete"}
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            {isLoadingCompletionQuote
              ? "We’re fetching the latest saved quote details from SQLite now."
              : activeQuote
                ? "Your vehicle build is now packaged as a presentation-ready quote and stored in the SQLite demo database."
                : "Your vehicle build has been captured successfully. You can start a fresh build anytime."}
          </p>

          {createQuoteMutation.error ? (
            <div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              Saving the quote failed. Please return to the configurator and try again.
            </div>
          ) : null}

          {activeQuote ? (
            <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5 text-left">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <CompletionInfo label="Quote ID" value={activeQuote.id} />
                <CompletionInfo
                  label="Saved at"
                  value={new Date(activeQuote.savedAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                />
                <CompletionInfo label="Market" value={quoteMarket?.name ?? activeQuote.market} />
                <CompletionInfo label="Dealer" value={quoteDealer?.name ?? activeQuote.dealer} />
              </div>

              <div className="mt-5 border-t border-slate-700/60 pt-4">
                <p className="text-xs uppercase tracking-wider text-slate-400">Quoted total</p>
                <p className="mt-2 text-3xl font-bold text-cyan-400">
                  {formatCurrency(activeQuote.price.totalPrice)}
                </p>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <p className="text-xs uppercase tracking-wider text-slate-400">Quote versions</p>
                  <span
                    className={[
                      "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider",
                      activeQuoteIsCurrent
                        ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : "border border-amber-500/30 bg-amber-500/10 text-amber-200",
                    ].join(" ")}
                  >
                    {activeQuoteIsCurrent ? "Current versions" : "Older version"}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {getConfigurationVersionEntries(activeQuote.versions).map(({ label, value }) => (
                    <CompletionInfo key={label} label={label} value={value} />
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-8 space-y-3">
            <Link
              href="/order-summary"
              className="inline-flex w-full items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 font-medium text-cyan-100 transition-colors hover:bg-cyan-500/20"
            >
              View Order Summary
            </Link>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                const latestQuote = latestQuoteQuery.data;

                if (latestQuote) {
                  applySavedQuote(latestQuote);
                }

                setCompletedQuote(null);
                setIsCompleted(false);
              }}
              disabled={!latestQuoteQuery.data || latestQuoteQuery.isLoading}
            >
              Load Last Saved Quote
            </Button>

            <Button
              className="w-full"
              onClick={() => {
                reset();
                setCompletedQuote(null);
                setIsCompleted(false);
              }}
            >
              Start New Configuration
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ConfiguratorLayout
        preview={<VehiclePreview />}
        wizard={
          <div className="flex flex-col gap-6">
            <ConfigurationContextCard />
            <RuleExplanationPanel />
            {evaluationQuery.error ? (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                Backend validation and pricing could not be refreshed right now. Showing the last known evaluation.
              </div>
            ) : null}
            {createQuoteMutation.error ? (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                We couldn’t save the quote. Please try again.
              </div>
            ) : null}
            <div>
              <StepWizard
                steps={steps}
                onComplete={handleComplete}
                isCompleting={createQuoteMutation.isPending}
              />
            </div>
          </div>
        }
      />
      <AiAssistantPanel />
    </>
  );
}

function CompletionInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}