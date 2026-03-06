'use client';

import { useConfigurationStore } from '@/lib/configuration-store';
import { wheels } from '@/lib/mock-data';
import { OptionCard } from '@/components/OptionCard';
import { OptionGrid } from '@/components/OptionGrid';

export function WheelsStep() {
  const { configuration, selectWheels } = useConfigurationStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Select Wheel Size</h2>
        <p className="text-sm text-slate-400">
          Choose from our range of stylish and performance-oriented wheels.
        </p>
      </div>

      <OptionGrid columns={2}>
        {wheels.map((wheel) => (
          <OptionCard
            key={wheel.id}
            id={wheel.id}
            name={wheel.name}
            description={`${wheel.size} • ${wheel.description}`}
            price={wheel.priceModifier}
            isSelected={configuration.wheels === wheel.id}
            onClick={() => selectWheels(wheel.id)}
          />
        ))}
      </OptionGrid>
    </div>
  );
}
