"use client";

import { useEffect, useState } from "react";
import { AiAssistantPanel } from "@/components/configurator/ai-assistant-panel";
import { ConfigurationContextCard } from "@/components/configurator/configuration-context-card";
import { RuleExplanationPanel } from "@/components/configurator/rule-explanation-panel";
import { ConfiguratorLayout } from "@/components/configurator/configurator-layout";
import { ConfigurationSummary } from "@/components/configurator/configuration-summary";
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
import { formatCurrency } from "@/lib/utils";
import { useConfigurationStore } from "@/store/configuration-store";

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

  useEffect(() => {
    void useConfigurationStore.persist.rehydrate();
  }, []);

  const reset = useConfigurationStore((state) => state.reset);
  const savedQuotes = useConfigurationStore((state) => state.savedQuotes);
  const activeQuoteId = useConfigurationStore((state) => state.activeQuoteId);
  const saveQuote = useConfigurationStore((state) => state.saveQuote);
  const loadLatestQuote = useConfigurationStore((state) => state.loadLatestQuote);
  const activeQuote = savedQuotes.find((quote) => quote.id === activeQuoteId) ?? null;
  const quoteMarket = activeQuote ? getMarketById(activeQuote.market) : null;
  const quoteDealer = activeQuote ? getDealerById(activeQuote.dealer) : null;

  const handleComplete = () => {
    if (!activeQuoteId) {
      saveQuote();
    }

    setIsCompleted(true);
  };

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
            {activeQuote ? "Quote Saved Successfully" : "Configuration Complete"}
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            {activeQuote
              ? "Your vehicle build is now packaged as a presentation-ready quote and stored locally in this browser."
              : "Your vehicle build has been captured successfully. You can start a fresh build anytime."}
          </p>

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
            </div>
          ) : null}

          <div className="mt-8 space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                loadLatestQuote();
                setIsCompleted(false);
              }}
              disabled={savedQuotes.length === 0}
            >
              Load Last Saved Quote
            </Button>

            <Button
              className="w-full"
              onClick={() => {
                reset();
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
            <div>
              <StepWizard steps={steps} onComplete={handleComplete} />
            </div>
          </div>
        }
        summary={<ConfigurationSummary />}
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