"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { getDealerById, getMarketById } from "@/lib/configurator/mock-data";
import { ProgressStepper } from "@/components/configurator/progress-stepper";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useConfigurationStore } from "@/store/configuration-store";
import { trpc } from "@/trpc/react";
import { formatCurrency } from "@/lib/utils";

type StepDefinition = {
  label: string;
  content: ReactNode;
};

type StepWizardProps = {
  steps: StepDefinition[];
  onComplete?: () => void | Promise<void>;
  isCompleting?: boolean;
};

export function StepWizard({ steps, onComplete, isCompleting = false }: StepWizardProps) {
  const currentStep = useConfigurationStore((state) => state.currentStep);
  const nextStep = useConfigurationStore((state) => state.nextStep);
  const previousStep = useConfigurationStore((state) => state.previousStep);
  const setCurrentStep = useConfigurationStore((state) => state.setCurrentStep);
  const reset = useConfigurationStore((state) => state.reset);
  const canContinue = useConfigurationStore((state) => state.isStepValid());
  const activeQuoteId = useConfigurationStore((state) => state.activeQuoteId);
  const isLoadedSavedQuote = useConfigurationStore((state) => state.isLoadedSavedQuote);
  const applySavedQuote = useConfigurationStore((state) => state.applySavedQuote);
  const quotesQuery = trpc.quote.list.useQuery();
  const [isSavedQuotesOpen, setIsSavedQuotesOpen] = useState(false);
  const savedQuotesPanelRef = useRef<HTMLDivElement | null>(null);

  const stepLabels = steps.map((step) => step.label);
  const current = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const savedQuotes = quotesQuery.data ?? [];
  const recentQuotes = savedQuotes.slice(0, 4);

  useEffect(() => {
    if (!isSavedQuotesOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!savedQuotesPanelRef.current?.contains(event.target as Node)) {
        setIsSavedQuotesOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSavedQuotesOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSavedQuotesOpen]);

  return (
    <div className="flex flex-col gap-6 pb-28">
      <div className="sticky top-0 z-20 -mx-5 -mt-5 border-b border-slate-700 bg-slate-900/95 px-5 py-5 shadow-[0_10px_30px_rgba(2,6,23,0.35)] backdrop-blur md:-mx-8 md:-mt-8 md:px-8 md:py-6">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Vehicle configurator</p>
            <h1 className="mt-2 text-2xl font-bold text-white">{current?.label ?? "Build"}</h1>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:items-end">
            <div className="relative" ref={savedQuotesPanelRef}>
              <Button
                variant="outline"
                size="sm"
                className="border-cyan-500/30 bg-cyan-500/5 text-cyan-100 hover:bg-cyan-500/10"
                onClick={() => setIsSavedQuotesOpen((open) => !open)}
                aria-expanded={isSavedQuotesOpen}
                aria-haspopup="dialog"
              >
                Saved quotes
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-300">
                  {savedQuotes.length}
                </span>
                <svg
                  className={cn("h-3.5 w-3.5 transition-transform", isSavedQuotesOpen && "rotate-180")}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>

              {isSavedQuotesOpen ? (
                <div className="absolute right-0 top-full z-30 mt-3 max-h-96 w-[400px] max-w-[calc(100vw-3rem)] rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl overflow-y-auto">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Saved quotes</p>
                  <p className="mt-2 text-sm text-slate-400">
                    Load one of your most recent saved configurations directly from the main header.
                  </p>

                  {quotesQuery.isLoading && recentQuotes.length === 0 ? (
                    <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-800/60 px-4 py-4 text-sm text-slate-400">
                      Loading persisted quotes...
                    </div>
                  ) : null}

                  {quotesQuery.error ? (
                    <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-sm text-amber-100">
                      Unable to load saved quotes right now. Please try again in a moment.
                    </div>
                  ) : null}

                  {!quotesQuery.isLoading && !quotesQuery.error && recentQuotes.length === 0 ? (
                    <div className="mt-4 rounded-2xl border border-dashed border-slate-700 bg-slate-800/40 px-4 py-4 text-sm text-slate-400">
                      No saved quotes yet. Save a configuration from the Review step and it will show up here.
                    </div>
                  ) : null}

                  {recentQuotes.length > 0 ? (
                    <div className="mt-4 space-y-2">
                      {recentQuotes.map((quote) => {
                        const quoteMarket = getMarketById(quote.market);
                        const quoteDealer = getDealerById(quote.dealer);
                        const isLoaded = quote.id === activeQuoteId;

                        return (
                          <button
                            key={quote.id}
                            type="button"
                            className="w-full rounded-2xl border border-slate-700 bg-slate-800/60 px-4 py-3 text-left transition-colors hover:border-cyan-500/30 hover:bg-slate-800"
                            onClick={() => {
                              applySavedQuote(quote);
                              setIsSavedQuotesOpen(false);
                            }}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-white">{quote.id}</p>
                                <p className="mt-1 text-xs text-slate-400">
                                  {quoteMarket?.name ?? quote.market} • {quoteDealer?.name ?? quote.dealer}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">{formatQuoteTimestamp(quote.savedAt)}</p>
                              </div>

                              <div className="text-right">
                                <p className="text-sm font-semibold text-cyan-300">
                                  {formatCurrency(quote.price.totalPrice)}
                                </p>
                                <span
                                  className={cn(
                                    "mt-3 -mr-2 inline-flex rounded-full px-4 py-1 text-[10px] font-semibold uppercase tracking-wider",
                                    isLoaded
                                      ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                      : "border border-slate-700 bg-slate-900 text-slate-300",
                                  )}
                                >
                                  {isLoaded ? "Loaded" : "Load quote"}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}

                  {savedQuotes.length > recentQuotes.length ? (
                    <p className="mt-3 text-xs text-slate-500">Showing the 4 most recent saved quotes.</p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <p className="text-xs text-slate-400">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
        </div>

        <ProgressStepper
          steps={stepLabels}
          currentStep={currentStep}
          onStepClick={(index) => {
            if (index <= currentStep) {
              setCurrentStep(index);
            }
          }}
        />
      </div>

      <div className="pr-1">
        <div className="min-h-full">{current?.content ?? null}</div>
      </div>

      <div className="sticky bottom-0 z-20 -mx-5 mt-2 border-t border-slate-700 bg-slate-900/95 px-5 py-4 shadow-[0_-10px_30px_rgba(2,6,23,0.4)] backdrop-blur md:-mx-8 md:px-8 md:py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            {currentStep > 0 ? (
              <Button variant="outline" onClick={previousStep}>
                Previous
              </Button>
            ) : (
              <div />
            )}

            {currentStep > 0 ? (
              <Button variant="ghost" onClick={reset} className="text-slate-400 hover:text-slate-200">
                Start over
              </Button>
            ) : null}
          </div>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            {!canContinue && !isLastStep ? (
              <p className="text-xs text-amber-300">Complete this step before continuing.</p>
            ) : null}

            {!isLastStep ? (
              <Button
                onClick={nextStep}
                disabled={!canContinue}
                className={cn(!canContinue && "cursor-not-allowed opacity-50")}
              >
                Continue
              </Button>
            ) : isLoadedSavedQuote ? (
              <Link
                href="/order-summary"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-cyan-500 px-4 py-2 font-medium text-slate-950 transition-colors hover:bg-cyan-600"
              >
                View order summary
              </Link>
            ) : (
              <Button
                onClick={() => void onComplete?.()}
                disabled={isCompleting}
                className={cn(
                  "bg-emerald-500 text-white hover:bg-emerald-600",
                  isCompleting && "cursor-not-allowed opacity-50",
                )}
              >
                {isCompleting ? "Saving quote..." : "Complete configuration"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatQuoteTimestamp(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}