import { cn } from '@/lib/utils';

interface ProgressStepperProps {
  steps: string[];
  currentStep: number;
}

export function ProgressStepper({ steps, currentStep }: ProgressStepperProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div className="flex items-center w-full">
              <div
                className={cn(
                  'relative flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm transition-colors duration-200',
                  index < currentStep
                    ? 'bg-cyan-500 text-white'
                    : index === currentStep
                      ? 'bg-cyan-500 text-white ring-2 ring-cyan-300'
                      : 'bg-slate-700 text-slate-400'
                )}
              >
                {index < currentStep ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-1 mx-2 transition-colors duration-200',
                    index < currentStep ? 'bg-cyan-500' : 'bg-slate-700'
                  )}
                />
              )}
            </div>
            <span
              className={cn(
                'text-xs mt-2 text-center font-medium transition-colors duration-200',
                index <= currentStep ? 'text-slate-100' : 'text-slate-500'
              )}
            >
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
