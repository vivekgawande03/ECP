import { cn } from "@/lib/utils";

type ProgressStepperProps = {
  steps: string[];
  currentStep: number;
  onStepClick?: (index: number) => void;
};

export function ProgressStepper({ steps, currentStep, onStepClick }: ProgressStepperProps) {
  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex min-w-max items-start gap-2">
        {steps.map((step, index) => {
          const isComplete = index < currentStep;
          const isActive = index === currentStep;
          const canJump = Boolean(onStepClick) && index <= currentStep;

          return (
            <div key={step} className="flex min-w-[84px] flex-1 items-start gap-2">
              <button
                type="button"
                onClick={() => canJump && onStepClick?.(index)}
                disabled={!canJump}
                className={cn("flex flex-col items-center text-center", !canJump && "cursor-default")}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                    isComplete && "bg-cyan-500 text-slate-950",
                    isActive && "bg-cyan-500 text-slate-950 ring-2 ring-cyan-300/60",
                    !isComplete && !isActive && "bg-slate-700 text-slate-400",
                  )}
                >
                  {isComplete ? (
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={cn("mt-2 text-xs font-medium", index <= currentStep ? "text-slate-100" : "text-slate-500")}>
                  {step}
                </span>
              </button>

              {index < steps.length - 1 ? (
                <div className={cn("mt-5 h-1 flex-1 rounded-full", isComplete ? "bg-cyan-500" : "bg-slate-700")} />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}