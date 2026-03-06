"use client";

import type { ReactNode } from "react";
import { ProgressStepper } from "@/components/configurator/progress-stepper";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useConfigurationStore } from "@/store/configuration-store";

type StepDefinition = {
  label: string;
  content: ReactNode;
};

type StepWizardProps = {
  steps: StepDefinition[];
  onComplete?: () => void;
};

export function StepWizard({ steps, onComplete }: StepWizardProps) {
  const currentStep = useConfigurationStore((state) => state.currentStep);
  const nextStep = useConfigurationStore((state) => state.nextStep);
  const previousStep = useConfigurationStore((state) => state.previousStep);
  const setCurrentStep = useConfigurationStore((state) => state.setCurrentStep);
  const reset = useConfigurationStore((state) => state.reset);
  const canContinue = useConfigurationStore((state) => state.isStepValid());

  const stepLabels = steps.map((step) => step.label);
  const current = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="sticky top-0 z-10 -mx-5 -mt-5 border-b border-slate-700 bg-slate-900/90 px-5 py-5 backdrop-blur md:-mx-8 md:-mt-8 md:px-8 md:py-6">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Vehicle configurator</p>
            <h1 className="mt-2 text-2xl font-bold text-white">{current?.label ?? "Build"}</h1>
          </div>
          <p className="text-xs text-slate-400">
            Step {currentStep + 1} of {steps.length}
          </p>
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

      <div className="border-t border-slate-700 pt-4">
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
            ) : (
              <Button onClick={() => onComplete?.()} className="bg-emerald-500 text-white hover:bg-emerald-600">
                Complete configuration
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}