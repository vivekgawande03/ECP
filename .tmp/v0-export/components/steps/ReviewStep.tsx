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

export function ReviewStep() {
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Review Your Configuration</h2>
        <p className="text-sm text-slate-400">
          Here's a complete summary of your customized vehicle.
        </p>
      </div>

      {/* Core Configuration */}
      <Card className="bg-slate-700/30 border-slate-600 p-6">
        <h3 className="text-sm font-semibold text-slate-100 uppercase mb-4 tracking-wider">
          Vehicle Configuration
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {model && (
            <div>
              <p className="text-xs text-slate-500 uppercase mb-1">Model</p>
              <p className="text-base font-semibold text-slate-100">{model.name}</p>
            </div>
          )}
          {engine && (
            <div>
              <p className="text-xs text-slate-500 uppercase mb-1">Engine</p>
              <p className="text-base font-semibold text-slate-100">{engine.name}</p>
            </div>
          )}
          {transmission && (
            <div>
              <p className="text-xs text-slate-500 uppercase mb-1">Transmission</p>
              <p className="text-base font-semibold text-slate-100">{transmission.name}</p>
            </div>
          )}
          {trim && (
            <div>
              <p className="text-xs text-slate-500 uppercase mb-1">Trim Level</p>
              <p className="text-base font-semibold text-slate-100">{trim.name}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Selected Options */}
      <div className="space-y-3">
        {configuration.exteriorOptions.length > 0 && (
          <Card className="bg-slate-700/30 border-slate-600 p-4">
            <p className="text-xs font-semibold text-slate-300 uppercase mb-3">Exterior Options</p>
            <div className="space-y-2">
              {configuration.exteriorOptions.map((optionId) => {
                const option = getExteriorOptionById(optionId);
                return option ? (
                  <div key={optionId} className="flex justify-between items-center text-sm">
                    <span className="text-slate-300">{option.name}</span>
                    <span className="text-cyan-400">
                      +${option.priceModifier.toLocaleString()}
                    </span>
                  </div>
                ) : null;
              })}
            </div>
          </Card>
        )}

        {configuration.interiorOptions.length > 0 && (
          <Card className="bg-slate-700/30 border-slate-600 p-4">
            <p className="text-xs font-semibold text-slate-300 uppercase mb-3">Interior Options</p>
            <div className="space-y-2">
              {configuration.interiorOptions.map((optionId) => {
                const option = getInteriorOptionById(optionId);
                return option ? (
                  <div key={optionId} className="flex justify-between items-center text-sm">
                    <span className="text-slate-300">{option.name}</span>
                    <span className="text-cyan-400">
                      +${option.priceModifier.toLocaleString()}
                    </span>
                  </div>
                ) : null;
              })}
            </div>
          </Card>
        )}

        {configuration.wheels && (
          <Card className="bg-slate-700/30 border-slate-600 p-4">
            <p className="text-xs font-semibold text-slate-300 uppercase mb-3">Wheels</p>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-300">{getWheelById(configuration.wheels)?.name}</span>
              <span className="text-cyan-400">
                +$
                {getWheelById(configuration.wheels)?.priceModifier.toLocaleString()}
              </span>
            </div>
          </Card>
        )}

        {configuration.packages.length > 0 && (
          <Card className="bg-slate-700/30 border-slate-600 p-4">
            <p className="text-xs font-semibold text-slate-300 uppercase mb-3">Packages</p>
            <div className="space-y-2">
              {configuration.packages.map((packageId) => {
                const pkg = getPackageById(packageId);
                return pkg ? (
                  <div key={packageId} className="flex justify-between items-center text-sm">
                    <span className="text-slate-300">{pkg.name}</span>
                    <span className="text-cyan-400">+${pkg.priceModifier.toLocaleString()}</span>
                  </div>
                ) : null;
              })}
            </div>
          </Card>
        )}
      </div>

      {/* Final Price */}
      <Card className="bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 border-cyan-500/30 p-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Estimated Total</p>
            <p className="text-3xl font-bold text-cyan-400">{formattedTotal}</p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>Ready to proceed?</p>
            <p>Click Complete to save</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
