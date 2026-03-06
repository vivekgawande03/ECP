"use client";

import { OptionCard } from "@/components/configurator/option-card";
import { OptionGrid } from "@/components/configurator/option-grid";
import { exteriorOptions } from "@/lib/configurator/mock-data";
import { useConfigurationStore } from "@/store/configuration-store";

export function ExteriorStep() {
  const configuration = useConfigurationStore((state) => state.configuration);
  const toggleExteriorOption = useConfigurationStore((state) => state.toggleExteriorOption);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-slate-100">Exterior customization</h2>
        <p className="text-sm text-slate-400">Choose your paint color and exterior enhancements.</p>
      </div>

      <OptionGrid columns={2}>
        {exteriorOptions.map((option) => {
          const isDisabled = option.disabledTrims?.includes(configuration.trimId ?? "") ?? false;

          return (
            <OptionCard
              key={option.id}
              name={option.name}
              description={option.description}
              price={option.priceModifier}
              color={option.color}
              isSelected={configuration.exteriorOptions.includes(option.id)}
              onClick={() => toggleExteriorOption(option.id)}
              isDisabled={isDisabled}
              disabledReason={isDisabled ? "Not available with this trim" : undefined}
            />
          );
        })}
      </OptionGrid>
    </div>
  );
}