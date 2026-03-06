"use client";

import { OptionCard } from "@/components/configurator/option-card";
import { OptionGrid } from "@/components/configurator/option-grid";
import { models } from "@/lib/configurator/mock-data";
import { formatCurrency } from "@/lib/utils";
import { useConfigurationStore } from "@/store/configuration-store";

export function ModelStep() {
  const configuration = useConfigurationStore((state) => state.configuration);
  const selectModel = useConfigurationStore((state) => state.selectModel);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-slate-100">Select your model</h2>
        <p className="text-sm text-slate-400">Choose the body style and platform that best fits your needs.</p>
      </div>

      <OptionGrid columns={2}>
        {models.map((model) => (
          <OptionCard
            key={model.id}
            name={model.name}
            description={model.description}
            price={model.basePrice}
            priceLabel={`From ${formatCurrency(model.basePrice)}`}
            isSelected={configuration.modelId === model.id}
            onClick={() => selectModel(model.id)}
          />
        ))}
      </OptionGrid>
    </div>
  );
}