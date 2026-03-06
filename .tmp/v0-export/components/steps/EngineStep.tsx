'use client';

import { useConfigurationStore } from '@/lib/configuration-store';
import { engines } from '@/lib/mock-data';
import { OptionCard } from '@/components/OptionCard';
import { OptionGrid } from '@/components/OptionGrid';

export function EngineStep() {
  const { configuration, selectEngine, getCompatibleEngines } = useConfigurationStore();
  const compatibleEngines = getCompatibleEngines();
  const availableEngines = engines.filter((e) => compatibleEngines.includes(e.id));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Choose Your Engine</h2>
        <p className="text-sm text-slate-400">
          Select the power source that matches your driving style.
        </p>
      </div>

      <OptionGrid columns={2}>
        {availableEngines.map((engine) => (
          <OptionCard
            key={engine.id}
            id={engine.id}
            name={engine.name}
            description={`${engine.horsePower}hp • ${engine.torque}Nm torque`}
            price={engine.priceModifier}
            isSelected={configuration.engineId === engine.id}
            onClick={() => selectEngine(engine.id)}
          />
        ))}
      </OptionGrid>

      {availableEngines.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-400">No engines available for this model.</p>
        </div>
      )}
    </div>
  );
}
