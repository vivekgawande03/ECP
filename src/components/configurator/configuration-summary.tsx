"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  getDealerById,
  getEngineById,
  getExteriorOptionById,
  getInteriorOptionById,
  getMarketById,
  getModelById,
  getPackageById,
  getTransmissionById,
  getTrimById,
  getWheelById,
} from "@/lib/configurator/mock-data";
import { formatCurrency } from "@/lib/utils";
import { useConfigurationStore } from "@/store/configuration-store";

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-slate-600/40 py-3 last:border-b-0">
      <p className="text-[11px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

export function ConfigurationSummary() {
  const configuration = useConfigurationStore((state) => state.configuration);
  const calculatePrice = useConfigurationStore((state) => state.calculatePrice);
  const price = calculatePrice();

  const market = getMarketById(configuration.market);
  const dealer = getDealerById(configuration.dealer);
  const model = configuration.modelId ? getModelById(configuration.modelId) : null;
  const engine = configuration.engineId ? getEngineById(configuration.engineId) : null;
  const transmission = configuration.transmissionId
    ? getTransmissionById(configuration.transmissionId)
    : null;
  const trim = configuration.trimId ? getTrimById(configuration.trimId) : null;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold uppercase tracking-wider text-white">Your Configuration</h3>
        <p className="mt-1 text-xs text-slate-500">Live summary and pricing update as you build.</p>
      </div>

      <Card className="border-slate-600 bg-slate-700/30 p-4">
        {market ? <SummaryRow label="Market" value={market.name} /> : null}
        {dealer ? <SummaryRow label="Dealer" value={dealer.name} /> : null}
        {model ? <SummaryRow label="Model" value={model.name} /> : null}
        {engine ? <SummaryRow label="Engine" value={engine.name} /> : null}
        {transmission ? <SummaryRow label="Transmission" value={transmission.name} /> : null}
        {trim ? <SummaryRow label="Trim" value={trim.name} /> : null}

        {configuration.exteriorOptions.length > 0 ? (
          <div className="border-b border-slate-600/40 py-3">
            <p className="mb-2 text-[11px] uppercase tracking-wider text-slate-500">Exterior</p>
            <div className="flex flex-wrap gap-2">
              {configuration.exteriorOptions.map((optionId) => {
                const option = getExteriorOptionById(optionId);
                return option ? (
                  <Badge key={optionId} variant="secondary" className="bg-slate-600 text-slate-100">
                    {option.name}
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
        ) : null}

        {configuration.interiorOptions.length > 0 ? (
          <div className="border-b border-slate-600/40 py-3">
            <p className="mb-2 text-[11px] uppercase tracking-wider text-slate-500">Interior</p>
            <div className="flex flex-wrap gap-2">
              {configuration.interiorOptions.map((optionId) => {
                const option = getInteriorOptionById(optionId);
                return option ? (
                  <Badge key={optionId} variant="secondary" className="bg-slate-600 text-slate-100">
                    {option.name}
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
        ) : null}

        {configuration.wheels ? (
          <SummaryRow label="Wheels" value={getWheelById(configuration.wheels)?.name ?? ""} />
        ) : null}

        {configuration.packages.length > 0 ? (
          <div className="py-3">
            <p className="mb-2 text-[11px] uppercase tracking-wider text-slate-500">Packages</p>
            <div className="space-y-1 text-sm text-slate-300">
              {configuration.packages.map((packageId) => {
                const pkg = getPackageById(packageId);
                return pkg ? <div key={packageId}>• {pkg.name}</div> : null;
              })}
            </div>
          </div>
        ) : null}
      </Card>

      <Card className="border-cyan-500/20 bg-cyan-500/5 p-4">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-300">Price Breakdown</h4>
        <div className="mb-3 space-y-2 border-b border-slate-700 pb-3 text-xs">
          {price.basePrice > 0 ? <PriceRow label="Base Price" value={price.basePrice} /> : null}
          {price.enginePrice > 0 ? <PriceRow label="Engine" value={price.enginePrice} /> : null}
          {price.transmissionPrice > 0 ? <PriceRow label="Transmission" value={price.transmissionPrice} /> : null}
          {price.trimPrice > 0 ? <PriceRow label="Trim" value={price.trimPrice} /> : null}
          {price.optionsPrice > 0 ? <PriceRow label="Options" value={price.optionsPrice} /> : null}
          {price.packagesPrice > 0 ? <PriceRow label="Packages" value={price.packagesPrice} /> : null}
        </div>
        <div className="flex items-end justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Total</span>
          <p className="text-2xl font-bold text-cyan-400">{formatCurrency(price.totalPrice)}</p>
        </div>
      </Card>
    </div>
  );
}

function PriceRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-slate-400">
      <span>{label}</span>
      <span className="text-slate-300">{formatCurrency(value)}</span>
    </div>
  );
}