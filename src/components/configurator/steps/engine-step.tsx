"use client";

import { OptionCard } from "@/components/configurator/option-card";
import { OptionGrid } from "@/components/configurator/option-grid";
import { engines } from "@/lib/configurator/mock-data";
import { getEngineDisabledReason } from "@/lib/configurator/rules";
import { useConfigurationStore } from "@/store/configuration-store";

export function EngineStep() {
  const configuration = useConfigurationStore((state) => state.configuration);
  const selectEngine = useConfigurationStore((state) => state.selectEngine);
  const getCompatibleEngines = useConfigurationStore((state) => state.getCompatibleEngines);

  const compatibleEngines = getCompatibleEngines();
  const availableEngines = engines.filter((engine) => compatibleEngines.includes(engine.id));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-slate-100">Choose your engine</h2>
        <p className="text-sm text-slate-400">Select the powertrain that matches your driving style.</p>
      </div>

      <OptionGrid columns={2}>
        {availableEngines.map((engine) => (
          (() => {
            const disabledReason = getEngineDisabledReason(configuration, engine.id);

            return (
              <OptionCard
                key={engine.id}
                name={engine.name}
                description={`${engine.horsePower} hp • ${engine.torque} Nm torque`}
                price={engine.priceModifier}
                isSelected={configuration.engineId === engine.id}
                onClick={() => selectEngine(engine.id)}
                isDisabled={Boolean(disabledReason)}
                disabledReason={disabledReason}
              />
            );
          })()
        ))}
      </OptionGrid>

      {availableEngines.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-400">Select a model first to see compatible engines.</div>
      ) : null}
    </div>
  );
}