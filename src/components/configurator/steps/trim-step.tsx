"use client";

import { OptionCard } from "@/components/configurator/option-card";
import { OptionGrid } from "@/components/configurator/option-grid";
import { Card } from "@/components/ui/card";
import { trims } from "@/lib/configurator/mock-data";
import { useConfigurationStore } from "@/store/configuration-store";

export function TrimStep() {
  const configuration = useConfigurationStore((state) => state.configuration);
  const selectTrim = useConfigurationStore((state) => state.selectTrim);
  const getCompatibleTrims = useConfigurationStore((state) => state.getCompatibleTrims);

  const compatibleTrims = getCompatibleTrims();
  const availableTrims = trims.filter((trim) => compatibleTrims.includes(trim.id));
  const selectedTrim = configuration.trimId ? trims.find((trim) => trim.id === configuration.trimId) : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-slate-100">Pick your trim level</h2>
        <p className="text-sm text-slate-400">Each trim unlocks a different combination of comfort, design, and capability.</p>
      </div>

      <OptionGrid columns={1}>
        {availableTrims.map((trim) => (
          <OptionCard
            key={trim.id}
            name={trim.name}
            description={trim.description}
            price={trim.priceModifier}
            isSelected={configuration.trimId === trim.id}
            onClick={() => selectTrim(trim.id)}
          />
        ))}
      </OptionGrid>

      {selectedTrim ? (
        <Card className="border-slate-600 bg-slate-700/50 p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-100">Included features</h3>
          <ul className="space-y-2">
            {selectedTrim.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="mt-0.5 text-cyan-400">+</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {availableTrims.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-400">Select a compatible engine first to see available trims.</div>
      ) : null}
    </div>
  );
}