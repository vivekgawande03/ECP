"use client";

import { Card } from "@/components/ui/card";
import { getExteriorOptionById, getModelById, getTrimById } from "@/lib/configurator/mock-data";
import { formatCurrency } from "@/lib/utils";
import { useConfigurationStore } from "@/store/configuration-store";

export function VehiclePreview() {
  const configuration = useConfigurationStore((state) => state.configuration);
  const calculatePrice = useConfigurationStore((state) => state.calculatePrice);

  const model = configuration.modelId ? getModelById(configuration.modelId) : null;
  const trim = configuration.trimId ? getTrimById(configuration.trimId) : null;
  const paint = configuration.exteriorOptions
    .map((optionId) => getExteriorOptionById(optionId))
    .find((option) => option?.type === "paint" && option.color);
  const primaryColor = paint?.color ?? "#ffffff";
  const totalPrice = calculatePrice();

  return (
    <div className="flex h-full flex-col gap-6">
      <Card className="relative flex flex-1 flex-col items-center justify-center overflow-hidden border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-8">
        <div
          className="absolute inset-0 opacity-15"
          style={{ background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)` }}
        />

        {model ? (
          <div className="relative z-10 flex h-full w-full flex-col items-center justify-center">
            <div className="relative mb-8 aspect-video w-full max-w-md rounded-3xl border border-slate-700/60 bg-slate-950/40">
              <div className="absolute inset-6 rounded-3xl opacity-15" style={{ backgroundColor: primaryColor }} />
              <svg className="absolute inset-0 h-full w-full text-slate-300" viewBox="0 0 400 200" fill="none">
                <path d="M 50 120 L 100 60 L 200 50 L 300 60 L 350 120 L 50 120 Z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.09" />
                <circle cx="120" cy="130" r="15" stroke="currentColor" strokeWidth="2" />
                <circle cx="280" cy="130" r="15" stroke="currentColor" strokeWidth="2" />
                <path d="M 120 90 L 150 70 L 250 70 L 280 90 L 120 90 Z" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.05" />
              </svg>
            </div>

            <div className="space-y-4 text-center">
              <div>
                <h2 className="text-3xl font-bold text-white">{model.name}</h2>
                {trim ? <p className="mt-1 text-sm font-semibold text-cyan-400">{trim.name} Trim</p> : null}
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-slate-700/60 pt-4 text-left">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">Base Price</p>
                  <p className="mt-1 text-lg font-semibold text-white">{formatCurrency(model.basePrice)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">Upgrades</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {formatCurrency(Math.max(totalPrice.totalPrice - model.basePrice, 0))}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">Paint</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-6 w-6 rounded border border-slate-600" style={{ backgroundColor: primaryColor }} />
                    <span className="text-xs text-slate-300">{paint?.name ?? "Standard"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-base text-slate-300">Select a model to begin</p>
            <p className="mt-2 text-xs text-slate-500">Your live vehicle preview appears here.</p>
          </div>
        )}
      </Card>

      {model ? (
        <Card className="border-slate-700 bg-slate-800 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Estimated Total</h3>
            <p className="text-2xl font-bold text-cyan-400">{formatCurrency(totalPrice.totalPrice)}</p>
          </div>
          <div className="space-y-2 text-sm text-slate-400">
            <div className="flex justify-between">
              <span>Selected options</span>
              <span className="text-slate-100">
                {configuration.exteriorOptions.length + configuration.interiorOptions.length + (configuration.wheels ? 1 : 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Packages</span>
              <span className="text-slate-100">{configuration.packages.length}</span>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}