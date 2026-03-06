'use client';

import { useConfigurationStore } from '@/lib/configuration-store';
import { trims } from '@/lib/mock-data';
import { OptionCard } from '@/components/OptionCard';
import { OptionGrid } from '@/components/OptionGrid';
import { Card } from '@/components/ui/card';

export function TrimStep() {
  const { configuration, selectTrim, getCompatibleTrims } = useConfigurationStore();
  const compatibleTrims = getCompatibleTrims();
  const availableTrims = trims.filter((t) => compatibleTrims.includes(t.id));
  const selectedTrim = configuration.trimId ? trims.find((t) => t.id === configuration.trimId) : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Pick Your Trim Level</h2>
        <p className="text-sm text-slate-400">
          Each trim unlocks different features and capabilities.
        </p>
      </div>

      <OptionGrid columns={1}>
        {availableTrims.map((trim) => (
          <OptionCard
            key={trim.id}
            id={trim.id}
            name={trim.name}
            description={trim.description}
            price={trim.priceModifier}
            isSelected={configuration.trimId === trim.id}
            onClick={() => selectTrim(trim.id)}
          />
        ))}
      </OptionGrid>

      {selectedTrim && (
        <Card className="bg-slate-700/50 border-slate-600 p-4">
          <h3 className="text-sm font-semibold text-slate-100 mb-3">Included Features</h3>
          <ul className="space-y-2">
            {selectedTrim.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="text-cyan-400 font-bold mt-0.5">+</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {availableTrims.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-400">No trims available for this engine.</p>
        </div>
      )}
    </div>
  );
}
