'use client';

import { useState } from 'react';
import { ConfiguratorLayout } from '@/components/ConfiguratorLayout';
import { VehiclePreview } from '@/components/VehiclePreview';
import { ConfigurationSummary } from '@/components/ConfigurationSummary';
import { StepWizard } from '@/components/StepWizard';
import { AiAssistantPanel } from '@/components/AiAssistantPanel';
import { ModelStep } from '@/components/steps/ModelStep';
import { EngineStep } from '@/components/steps/EngineStep';
import { TransmissionStep } from '@/components/steps/TransmissionStep';
import { TrimStep } from '@/components/steps/TrimStep';
import { ExteriorStep } from '@/components/steps/ExteriorStep';
import { InteriorStep } from '@/components/steps/InteriorStep';
import { WheelsStep } from '@/components/steps/WheelsStep';
import { PackagesStep } from '@/components/steps/PackagesStep';
import { ReviewStep } from '@/components/steps/ReviewStep';
import { useConfigurationStore } from '@/lib/configuration-store';

export default function Home() {
  const [isCompleted, setIsCompleted] = useState(false);
  const { configuration } = useConfigurationStore();

  const steps = [
    { label: 'Model', content: <ModelStep /> },
    { label: 'Engine', content: <EngineStep /> },
    { label: 'Transmission', content: <TransmissionStep /> },
    { label: 'Trim', content: <TrimStep /> },
    { label: 'Exterior', content: <ExteriorStep /> },
    { label: 'Interior', content: <InteriorStep /> },
    { label: 'Wheels', content: <WheelsStep /> },
    { label: 'Packages', content: <PackagesStep /> },
    { label: 'Review', content: <ReviewStep /> },
  ];

  const handleComplete = () => {
    setIsCompleted(true);
    // Could save configuration to database or trigger next action
    console.log('Configuration completed:', configuration);
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Configuration Complete!</h1>
          <p className="text-slate-400 mb-8">
            Your vehicle configuration has been saved successfully.
          </p>
          <button
            onClick={() => {
              setIsCompleted(false);
              useConfigurationStore.setState({
                configuration: {
                  modelId: null,
                  engineId: null,
                  transmissionId: null,
                  trimId: null,
                  exteriorOptions: [],
                  interiorOptions: [],
                  wheels: null,
                  packages: [],
                },
                currentStep: 0,
                warnings: [],
              });
            }}
            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold rounded-lg transition-colors"
          >
            Start New Configuration
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ConfiguratorLayout
        preview={<VehiclePreview />}
        wizard={
          <StepWizard
            steps={steps}
            onComplete={handleComplete}
          />
        }
        summary={<ConfigurationSummary />}
      />
      <AiAssistantPanel />
    </>
  );
}
