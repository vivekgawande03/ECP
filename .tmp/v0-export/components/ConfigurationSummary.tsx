'use client';

import { useConfigurationStore } from '@/lib/configuration-store';
import {
  getModelById,
  getEngineById,
  getTransmissionById,
  getTrimById,
  getExteriorOptionById,
  getInteriorOptionById,
  getWheelById,
  getPackageById,
} from '@/lib/mock-data';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ConfigurationSummary() {
  const { configuration, calculatePrice } = useConfigurationStore();
  const priceBreakdown = calculatePrice();

  const model = configuration.modelId ? getModelById(configuration.modelId) : null;
  const engine = configuration.engineId ? getEngineById(configuration.engineId) : null;
  const transmission = configuration.transmissionId
    ? getTransmissionById(configuration.transmissionId)
    : null;
  const trim = configuration.trimId ? getTrimById(configuration.trimId) : null;

  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(priceBreakdown.totalPrice);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-100 uppercase tracking-wider">
        Your Configuration
      </h3>

      <Card className="bg-slate-700/30 border-slate-600 p-4">
        {/* Model */}
        {model && (
          <div className="pb-3 border-b border-slate-600/50">
            <p className="text-xs text-slate-500 uppercase">Model</p>
            <p className="text-sm font-semibold text-slate-100">{model.name}</p>
          </div>
        )}

        {/* Engine */}
        {engine && (
          <div className="py-3 border-b border-slate-600/50">
            <p className="text-xs text-slate-500 uppercase">Engine</p>
            <p className="text-sm font-semibold text-slate-100">{engine.name}</p>
          </div>
        )}

        {/* Transmission */}
        {transmission && (
          <div className="py-3 border-b border-slate-600/50">
            <p className="text-xs text-slate-500 uppercase">Transmission</p>
            <p className="text-sm font-semibold text-slate-100">{transmission.name}</p>
          </div>
        )}

        {/* Trim */}
        {trim && (
          <div className="py-3 border-b border-slate-600/50">
            <p className="text-xs text-slate-500 uppercase">Trim</p>
            <p className="text-sm font-semibold text-slate-100">{trim.name}</p>
          </div>
        )}

        {/* Exterior Options */}
        {configuration.exteriorOptions.length > 0 && (
          <div className="py-3 border-b border-slate-600/50">
            <p className="text-xs text-slate-500 uppercase mb-2">Exterior</p>
            <div className="flex flex-wrap gap-2">
              {configuration.exteriorOptions.map((optionId) => {
                const option = getExteriorOptionById(optionId);
                return option ? (
                  <Badge
                    key={optionId}
                    variant="secondary"
                    className="bg-slate-600 hover:bg-slate-500 text-slate-100"
                  >
                    {option.name}
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Interior Options */}
        {configuration.interiorOptions.length > 0 && (
          <div className="py-3 border-b border-slate-600/50">
            <p className="text-xs text-slate-500 uppercase mb-2">Interior</p>
            <div className="flex flex-wrap gap-2">
              {configuration.interiorOptions.map((optionId) => {
                const option = getInteriorOptionById(optionId);
                return option ? (
                  <Badge
                    key={optionId}
                    variant="secondary"
                    className="bg-slate-600 hover:bg-slate-500 text-slate-100"
                  >
                    {option.name}
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Wheels */}
        {configuration.wheels && (
          <div className="py-3 border-b border-slate-600/50">
            <p className="text-xs text-slate-500 uppercase">Wheels</p>
            <p className="text-sm font-semibold text-slate-100">
              {getWheelById(configuration.wheels)?.name}
            </p>
          </div>
        )}

        {/* Packages */}
        {configuration.packages.length > 0 && (
          <div className="py-3">
            <p className="text-xs text-slate-500 uppercase mb-2">Packages</p>
            <div className="space-y-1">
              {configuration.packages.map((packageId) => {
                const pkg = getPackageById(packageId);
                return pkg ? (
                  <div key={packageId} className="text-sm text-slate-300">
                    • {pkg.name}
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Price Breakdown */}
      <Card className="bg-cyan-500/5 border-cyan-500/20 p-4">
        <h4 className="text-xs font-semibold text-slate-300 uppercase mb-3 tracking-wider">
          Price Breakdown
        </h4>

        <div className="space-y-2 text-xs mb-3 pb-3 border-b border-slate-600/30">
          {priceBreakdown.basePrice > 0 && (
            <div className="flex justify-between text-slate-400">
              <span>Base Price</span>
              <span className="text-slate-300">${priceBreakdown.basePrice.toLocaleString()}</span>
            </div>
          )}
          {priceBreakdown.enginePrice > 0 && (
            <div className="flex justify-between text-slate-400">
              <span>Engine</span>
              <span className="text-slate-300">${priceBreakdown.enginePrice.toLocaleString()}</span>
            </div>
          )}
          {priceBreakdown.transmissionPrice > 0 && (
            <div className="flex justify-between text-slate-400">
              <span>Transmission</span>
              <span className="text-slate-300">
                ${priceBreakdown.transmissionPrice.toLocaleString()}
              </span>
            </div>
          )}
          {priceBreakdown.trimPrice > 0 && (
            <div className="flex justify-between text-slate-400">
              <span>Trim</span>
              <span className="text-slate-300">${priceBreakdown.trimPrice.toLocaleString()}</span>
            </div>
          )}
          {priceBreakdown.optionsPrice > 0 && (
            <div className="flex justify-between text-slate-400">
              <span>Options</span>
              <span className="text-slate-300">
                ${priceBreakdown.optionsPrice.toLocaleString()}
              </span>
            </div>
          )}
          {priceBreakdown.packagesPrice > 0 && (
            <div className="flex justify-between text-slate-400">
              <span>Packages</span>
              <span className="text-slate-300">
                ${priceBreakdown.packagesPrice.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-end">
          <span className="text-xs font-semibold text-slate-300 uppercase">Total</span>
          <div className="text-right">
            <p className="text-2xl font-bold text-cyan-400">{formattedTotal}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
