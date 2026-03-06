"use client";

import { OptionCard } from "@/components/configurator/option-card";
import { OptionGrid } from "@/components/configurator/option-grid";
import { wheels } from "@/lib/configurator/mock-data";
import { useConfigurationStore } from "@/store/configuration-store";

export function WheelsStep() {
  const configuration = useConfigurationStore((state) => state.configuration);
  const selectWheels = useConfigurationStore((state) => state.selectWheels);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-slate-100">Select wheel size</h2>
        <p className="text-sm text-slate-400">Choose from a range of comfort- and performance-oriented wheel packages.</p>
      </div>

      <OptionGrid columns={2}>
        {wheels.map((wheel) => (
          <OptionCard
            key={wheel.id}
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