'use client';

import { useConfigurationStore } from '@/lib/configuration-store';
import { transmissions } from '@/lib/mock-data';
import { OptionCard } from '@/components/OptionCard';
import { OptionGrid } from '@/components/OptionGrid';

export function TransmissionStep() {
  const { configuration, selectTransmission, getCompatibleTransmissions } =
    useConfigurationStore();
  const compatibleTransmissions = getCompatibleTransmissions();
  const availableTransmissions = transmissions.filter((t) =>
    compatibleTransmissions.includes(t.id)
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Select Transmission</h2>
        <p className="text-sm text-slate-400">
          Choose how power is delivered to the wheels.
        </p>
      </div>

      <OptionGrid columns={2}>
        {availableTransmissions.map((transmission) => (
          <OptionCard
            key={transmission.id}
            id={transmission.id}
            name={transmission.name}
            description={`${transmission.type.charAt(0).toUpperCase() + transmission.type.slice(1)} transmission`}
            price={transmission.priceModifier}
            isSelected={configuration.transmissionId === transmission.id}
            onClick={() => selectTransmission(transmission.id)}
          />
        ))}
      </OptionGrid>

      {availableTransmissions.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-400">No transmissions available for this engine.</p>
        </div>
      )}
    </div>
  );
}
