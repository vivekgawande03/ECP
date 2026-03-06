'use client';

import { useConfigurationStore } from '@/lib/configuration-store';
import { packages } from '@/lib/mock-data';
import { OptionCard } from '@/components/OptionCard';
import { OptionGrid } from '@/components/OptionGrid';
import { Card } from '@/components/ui/card';

export function PackagesStep() {
  const { configuration, togglePackage } = useConfigurationStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Add Packages</h2>
        <p className="text-sm text-slate-400">
          Bundle complementary features and services for greater value.
        </p>
      </div>

      <OptionGrid columns={1}>
        {packages.map((pkg) => (
          <div key={pkg.id}>
            <OptionCard
              id={pkg.id}
              name={pkg.name}
              description={pkg.description}
              price={pkg.priceModifier}
              isSelected={configuration.packages.includes(pkg.id)}
              onClick={() => togglePackage(pkg.id)}
              isDisabled={pkg.disabledTrims?.includes(configuration.trimId || '') ?? false}
              disabledReason={
                pkg.disabledTrims?.includes(configuration.trimId || '')
                  ? 'Not available with this trim'
                  : undefined
              }
            />
            {configuration.packages.includes(pkg.id) && (
              <Card className="bg-slate-700/30 border-slate-600 p-3 mt-2">
                <p className="text-xs text-slate-300 font-semibold mb-2">Includes:</p>
                <ul className="space-y-1">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="text-xs text-slate-400 flex items-start gap-2">
                      <span className="text-cyan-400 flex-shrink-0">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        ))}
      </OptionGrid>
    </div>
  );
}
