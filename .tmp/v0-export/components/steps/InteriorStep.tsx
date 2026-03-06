'use client';

import { useConfigurationStore } from '@/lib/configuration-store';
import { interiorOptions } from '@/lib/mock-data';
import { OptionCard } from '@/components/OptionCard';
import { OptionGrid } from '@/components/OptionGrid';

export function InteriorStep() {
  const { configuration, toggleInteriorOption } = useConfigurationStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Interior Customization</h2>
        <p className="text-sm text-slate-400">
          Select upholstery, trim materials, and interior upgrades.
        </p>
      </div>

      <OptionGrid columns={2}>
        {interiorOptions.map((option) => (
          <OptionCard
            key={option.id}
            id={option.id}
            name={option.name}
            description={option.description}
            price={option.priceModifier}
            isSelected={configuration.interiorOptions.includes(option.id)}
            color={option.color}
            onClick={() => toggleInteriorOption(option.id)}
            isDisabled={option.disabledTrims?.includes(configuration.trimId || '') ?? false}
            disabledReason={
              option.disabledTrims?.includes(configuration.trimId || '')
                ? 'Not available with this trim'
                : undefined
            }
          />
        ))}
      </OptionGrid>
    </div>
  );
}
