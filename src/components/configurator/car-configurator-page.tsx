"use client";

import { useState } from "react";
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
  const reset = useConfigurationStore((state) => state.reset);

  if (isCompleted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-center shadow-2xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
            <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Configuration Complete</h1>
          <p className="mt-3 text-sm text-slate-400">
            Your vehicle build has been captured successfully. You can start a fresh build anytime.
          </p>
          <Button
            className="mt-8 w-full"
            onClick={() => {
              reset();
              setIsCompleted(false);
            }}
          >
            Start New Configuration
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ConfiguratorLayout
        preview={<VehiclePreview />}
        wizard={
          <div className="flex h-full min-h-0 flex-col gap-6">
            <ConfigurationContextCard />
            <RuleExplanationPanel />
            <div className="min-h-0 flex-1">
              <StepWizard steps={steps} onComplete={() => setIsCompleted(true)} />
            </div>
          </div>
        }
        summary={<ConfigurationSummary />}
      />
      <AiAssistantPanel />
    </>
  );
}