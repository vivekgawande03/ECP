'use client';

import { useConfigurationStore } from '@/lib/configuration-store';
import { exteriorOptions } from '@/lib/mock-data';
import { OptionCard } from '@/components/OptionCard';
import { OptionGrid } from '@/components/OptionGrid';

export function ExteriorStep() {
  const { configuration, toggleExteriorOption } = useConfigurationStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Exterior Customization</h2>
        <p className="text-sm text-slate-400">
          Choose your paint color and add exterior enhancements.
        </p>
      </div>

      <OptionGrid columns={2}>
        {exteriorOptions.map((option) => (
          <OptionCard
            key={option.id}
            id={option.id}
            name={option.name}
            description={option.description}
            price={option.priceModifier}
            isSelected={configuration.exteriorOptions.includes(option.id)}
            color={option.color}
            onClick={() => toggleExteriorOption(option.id)}
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
