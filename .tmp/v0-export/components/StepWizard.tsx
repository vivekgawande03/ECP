'use client';

import { ReactNode } from 'react';
import { useConfigurationStore } from '@/lib/configuration-store';
import { ProgressStepper } from '@/components/ProgressStepper';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StepWizardProps {
  steps: { label: string; content: ReactNode }[];
  onComplete?: () => void;
}

export function StepWizard({ steps, onComplete }: StepWizardProps) {
  const { currentStep, nextStep, previousStep, setCurrentStep, isStepValid, reset } =
    useConfigurationStore();

  const stepLabels = steps.map((s) => s.label);
  const currentContent = steps[currentStep]?.content;
  const isLastStep = currentStep === steps.length - 1;
  const canContinue = isStepValid();

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Progress Indicator */}
      <div className="sticky top-0 bg-slate-800/50 -mx-6 -mt-6 px-6 pt-6 pb-4 z-10">
        <ProgressStepper steps={stepLabels} currentStep={currentStep} />
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-max">{currentContent}</div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4 border-t border-slate-700">
        {currentStep > 0 ? (
          <Button
            variant="outline"
            onClick={previousStep}
            className="px-6 bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-100"
          >
            Previous
          </Button>
        ) : (
          <div />
        )}

        <div className="flex gap-2 ml-auto">
          {currentStep > 0 && (
            <Button
              variant="ghost"
              onClick={() => reset()}
              className="px-4 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
            >
              Start Over
            </Button>
          )}

          {!isLastStep ? (
            <Button
              onClick={nextStep}
              disabled={!canContinue}
              className={cn(
                'px-8 bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold transition-all',
                !canContinue && 'opacity-50 cursor-not-allowed'
              )}
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={() => onComplete?.()}
              className="px-8 bg-green-500 hover:bg-green-600 text-white font-semibold"
            >
              Complete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
