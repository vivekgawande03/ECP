"use client";

import { OptionCard } from "@/components/configurator/option-card";
import { OptionGrid } from "@/components/configurator/option-grid";
import { Card } from "@/components/ui/card";
import { packages } from "@/lib/configurator/mock-data";
import { useConfigurationStore } from "@/store/configuration-store";

export function PackagesStep() {
  const configuration = useConfigurationStore((state) => state.configuration);
  const togglePackage = useConfigurationStore((state) => state.togglePackage);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-slate-100">Add packages</h2>
        <p className="text-sm text-slate-400">Bundle complementary features and services for greater value.</p>
      </div>

      <OptionGrid columns={1}>
        {packages.map((pkg) => {
          const isDisabled = pkg.disabledTrims?.includes(configuration.trimId ?? "") ?? false;
          const isSelected = configuration.packages.includes(pkg.id);

          return (
            <div key={pkg.id}>
              <OptionCard
                name={pkg.name}
                description={pkg.description}
                price={pkg.priceModifier}
                isSelected={isSelected}
                onClick={() => togglePackage(pkg.id)}
                isDisabled={isDisabled}
                disabledReason={isDisabled ? "Not available with this trim" : undefined}
              />

              {isSelected ? (
                <Card className="mt-2 border-slate-600 bg-slate-700/30 p-3">
                  <p className="mb-2 text-xs font-semibold text-slate-300">Includes:</p>
                  <ul className="space-y-1">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-xs text-slate-400">
                        <span className="text-cyan-400">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ) : null}
            </div>
          );
        })}
      </OptionGrid>
    </div>
  );
}