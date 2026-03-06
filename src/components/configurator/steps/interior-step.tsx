"use client";

import { OptionCard } from "@/components/configurator/option-card";
import { OptionGrid } from "@/components/configurator/option-grid";
import { interiorOptions } from "@/lib/configurator/mock-data";
import { getInteriorDisabledReason } from "@/lib/configurator/rules";
import { useConfigurationStore } from "@/store/configuration-store";

export function InteriorStep() {
  const configuration = useConfigurationStore((state) => state.configuration);
  const toggleInteriorOption = useConfigurationStore((state) => state.toggleInteriorOption);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-slate-100">Interior customization</h2>
        <p className="text-sm text-slate-400">Select upholstery, trim materials, and interior upgrades.</p>
      </div>

      <OptionGrid columns={2}>
        {interiorOptions.map((option) => {
          const disabledReason = getInteriorDisabledReason(configuration, option.id);

          return (
            <OptionCard
              key={option.id}
              name={option.name}
              description={option.description}
              price={option.priceModifier}
              color={option.color}
              isSelected={configuration.interiorOptions.includes(option.id)}
              onClick={() => toggleInteriorOption(option.id)}
              isDisabled={Boolean(disabledReason)}
              disabledReason={disabledReason}
            />
          );
        })}
      </OptionGrid>
    </div>
  );
}