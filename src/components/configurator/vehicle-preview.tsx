"use client";

import { ConfiguratorViewer } from "@/components/configurator/3d/configurator-viewer";
import { Card } from "@/components/ui/card";
import { getModelById, getTrimById } from "@/lib/configurator/mock-data";
import { getVehicleVisualSpec } from "@/lib/configurator/3d/visual-spec";
import { formatCurrency } from "@/lib/utils";
import { useConfigurationStore } from "@/store/configuration-store";

export function VehiclePreview() {
  const configuration = useConfigurationStore((state) => state.configuration);
  const calculatePrice = useConfigurationStore((state) => state.calculatePrice);

  const model = configuration.modelId ? getModelById(configuration.modelId) : null;
  const trim = configuration.trimId ? getTrimById(configuration.trimId) : null;
  const visualSpec = getVehicleVisualSpec(configuration);
  const primaryColor = visualSpec.paint.color;
  const price = calculatePrice();
  const selectedOptionCount =
    configuration.exteriorOptions.length + configuration.interiorOptions.length + (configuration.wheels ? 1 : 0);

  return (
    <div className="flex h-full flex-col gap-4 pb-4 lg:gap-5 lg:pb-5">
      <Card className="relative flex min-h-[420px] flex-1 flex-col overflow-hidden border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-5 lg:min-h-[560px] lg:p-6">
        <div
          className="absolute inset-0 opacity-15"
          style={{ background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)` }}
        />

        {model ? (
          <div className="relative z-10 flex h-full w-full flex-col">          
            <div className="relative flex-1 overflow-hidden rounded-[28px] border border-slate-700/60 bg-slate-950/40 shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
              <ConfiguratorViewer modelName={model.name} visualSpec={visualSpec} />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">Base price</p>
                <p className="mt-1 text-lg font-semibold text-white">{formatCurrency(price.basePrice)}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">Selected options</p>
                <p className="mt-1 text-lg font-semibold text-white">{selectedOptionCount + configuration.packages.length}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">Paint</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-6 w-6 rounded border border-slate-600" style={{ backgroundColor: primaryColor }} />
                  <span className="text-xs text-slate-300">{visualSpec.paint.name ?? "Standard"}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative z-10 flex flex-1 items-center justify-center text-center">
            <p className="text-base text-slate-300">Select a model to begin</p>
            <p className="mt-2 text-xs text-slate-500">Your live vehicle preview appears here.</p>
          </div>
        )}
      </Card>

      {model ? (
        <Card className="border-cyan-500/20 bg-slate-800/95 p-5">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Price Breakdown</h3>
              <p className="mt-1 text-xs text-slate-500">Live pricing stays next to the 3D preview while you build.</p>
            </div>
            <p className="text-2xl font-bold text-cyan-400">{formatCurrency(price.totalPrice)}</p>
          </div>

          <div className="space-y-2 border-b border-slate-700/80 pb-4 text-sm">
            {price.basePrice > 0 ? <PriceBreakdownRow label="Base Price" value={price.basePrice} /> : null}
            {price.enginePrice > 0 ? <PriceBreakdownRow label="Engine" value={price.enginePrice} /> : null}
            {price.transmissionPrice > 0 ? <PriceBreakdownRow label="Transmission" value={price.transmissionPrice} /> : null}
            {price.trimPrice > 0 ? <PriceBreakdownRow label="Trim" value={price.trimPrice} /> : null}
            {price.optionsPrice > 0 ? <PriceBreakdownRow label="Options" value={price.optionsPrice} /> : null}
            {price.packagesPrice > 0 ? <PriceBreakdownRow label="Packages" value={price.packagesPrice} /> : null}
            {price.dealerDiscount > 0 ? (
              <PriceBreakdownRow
                label={price.dealerDiscountLabel ?? "Dealer incentive"}
                value={price.dealerDiscount}
                isDiscount
              />
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-400 sm:flex sm:items-center sm:gap-6">
              <span>
                Options <span className="ml-1 text-slate-100">{selectedOptionCount}</span>
              </span>
              <span>
                Packages <span className="ml-1 text-slate-100">{configuration.packages.length}</span>
              </span>
            </div>

            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Final total</p>
              <p className="mt-1 text-3xl font-bold text-cyan-400">{formatCurrency(price.totalPrice)}</p>
            </div>
          </div>
        </Card>
      ) : null}
      <br/>
    </div>
  );
}

function PriceBreakdownRow({
  label,
  value,
  isDiscount = false,
}: {
  label: string;
  value: number;
  isDiscount?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-slate-400">
      <span>{label}</span>
      <span className={isDiscount ? "font-semibold text-emerald-300" : "text-slate-200"}>
        {isDiscount ? `-${formatCurrency(value)}` : formatCurrency(value)}
      </span>
    </div>
  );
}