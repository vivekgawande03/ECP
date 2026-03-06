'use client';

import { useConfigurationStore } from '@/lib/configuration-store';
import { models } from '@/lib/mock-data';
import { OptionCard } from '@/components/OptionCard';
import { OptionGrid } from '@/components/OptionGrid';

export function ModelStep() {
  const { configuration, selectModel } = useConfigurationStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Select Your Model</h2>
        <p className="text-sm text-slate-400">
          Choose the vehicle model that fits your needs and lifestyle.
        </p>
      </div>

      <OptionGrid columns={2}>
        {models.map((model) => (
          <OptionCard
            key={model.id}
            id={model.id}
            name={model.name}
            description={model.description}
            price={model.basePrice}
            isSelected={configuration.modelId === model.id}
            onClick={() => selectModel(model.id)}
          />
        ))}
      </OptionGrid>
    </div>
  );
}
