'use client';

import Image from 'next/image';
import { useConfigurationStore } from '@/lib/configuration-store';
import { getModelById, getExteriorOptionById, getTrimById } from '@/lib/mock-data';
import { Card } from '@/components/ui/card';

export function VehiclePreview() {
  const { configuration, calculatePrice } = useConfigurationStore();
  const model = configuration.modelId ? getModelById(configuration.modelId) : null;
  const trim = configuration.trimId ? getTrimById(configuration.trimId) : null;

  // Get the primary exterior color (paint)
  let primaryColor = '#FFFFFF';
  configuration.exteriorOptions.forEach((optionId) => {
    const option = getExteriorOptionById(optionId);
    if (option?.type === 'paint' && option.color) {
      primaryColor = option.color;
    }
  });

  const priceBreakdown = calculatePrice();
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(priceBreakdown.totalPrice);

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Main Vehicle Display */}
      <Card className="flex-1 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-8 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background decorative element */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)`,
          }}
        />

        {model ? (
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
            {/* Placeholder car image with color overlay */}
            <div className="relative w-full max-w-96 aspect-video mb-8">
              <div
                className="w-full h-full rounded-lg bg-cover bg-center transition-colors duration-500"
                style={{
                  backgroundColor: primaryColor,
                  opacity: 0.15,
                }}
              />
              <svg
                className="absolute inset-0 w-full h-full text-slate-400"
                viewBox="0 0 400 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Simple car silhouette */}
                <path
                  d="M 50 120 L 100 60 L 200 50 L 300 60 L 350 120 L 50 120 Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="currentColor"
                  fillOpacity="0.1"
                />
                <circle cx="120" cy="130" r="15" stroke="currentColor" strokeWidth="2" fill="none" />
                <circle cx="280" cy="130" r="15" stroke="currentColor" strokeWidth="2" fill="none" />
                <path
                  d="M 120 90 L 150 70 L 250 70 L 280 90 L 120 90 Z"
                  stroke="currentColor"
                  strokeWidth="1"
                  fill="currentColor"
                  fillOpacity="0.05"
                />
              </svg>
            </div>

            {/* Vehicle Details */}
            <div className="text-center space-y-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-100 mb-1">{model.name}</h2>
                {trim && <p className="text-sm text-cyan-400 font-semibold">{trim.name} Trim</p>}
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700/50">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Base Price</p>
                  <p className="text-lg font-semibold text-slate-100">
                    ${model.basePrice.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Total Options</p>
                  <p className="text-lg font-semibold text-slate-100">
                    ${(priceBreakdown.totalPrice - model.basePrice).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Paint Color</p>
                  <div className="flex items-center justify-center mt-1 gap-2">
                    <div
                      className="w-6 h-6 rounded border border-slate-600"
                      style={{ backgroundColor: primaryColor }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-slate-400 mb-2">Select a model to begin</p>
            <p className="text-xs text-slate-600">Choose your car model from the wizard</p>
          </div>
        )}
      </Card>

      {/* Quick Stats */}
      {model && (
        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Estimated Total
            </h3>
            <div className="text-right">
              <p className="text-2xl font-bold text-cyan-400">{formattedPrice}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Options Selected:</span>
              <span className="text-slate-100">
                {configuration.exteriorOptions.length +
                  configuration.interiorOptions.length +
                  (configuration.wheels ? 1 : 0)}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Packages:</span>
              <span className="text-slate-100">{configuration.packages.length}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
