"use client";

import { OptionCard } from "@/components/configurator/option-card";
import { OptionGrid } from "@/components/configurator/option-grid";
import { transmissions } from "@/lib/configurator/mock-data";
import { useConfigurationStore } from "@/store/configuration-store";

export function TransmissionStep() {
  const configuration = useConfigurationStore((state) => state.configuration);
  const selectTransmission = useConfigurationStore((state) => state.selectTransmission);
  const getCompatibleTransmissions = useConfigurationStore((state) => state.getCompatibleTransmissions);

  const compatibleTransmissions = getCompatibleTransmissions();
  const availableTransmissions = transmissions.filter((transmission) => compatibleTransmissions.includes(transmission.id));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-slate-100">Select transmission</h2>
        <p className="text-sm text-slate-400">Choose how power is delivered to the wheels.</p>
      </div>

      <OptionGrid columns={2}>
        {availableTransmissions.map((transmission) => (
          <OptionCard
            key={transmission.id}
            name={transmission.name}
            description={`${transmission.type.toUpperCase()} transmission`}
            price={transmission.priceModifier}
            isSelected={configuration.transmissionId === transmission.id}
            onClick={() => selectTransmission(transmission.id)}
          />
        ))}
      </OptionGrid>

      {availableTransmissions.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-400">Select an engine first to see compatible transmissions.</div>
      ) : null}
    </div>
  );
}