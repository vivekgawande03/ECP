"use client";

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

export function ReviewStep() {
  const configuration = useConfigurationStore((state) => state.configuration);
  const calculatePrice = useConfigurationStore((state) => state.calculatePrice);
  const price = calculatePrice();

  const market = getMarketById(configuration.market);
  const dealer = getDealerById(configuration.dealer);
  const model = configuration.modelId ? getModelById(configuration.modelId) : null;
  const engine = configuration.engineId ? getEngineById(configuration.engineId) : null;
  const transmission = configuration.transmissionId ? getTransmissionById(configuration.transmissionId) : null;
  const trim = configuration.trimId ? getTrimById(configuration.trimId) : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-slate-100">Review your configuration</h2>
        <p className="text-sm text-slate-400">Here’s the full summary of your customized vehicle before completion.</p>
      </div>

      <Card className="border-slate-600 bg-slate-700/30 p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-100">Vehicle configuration</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {market ? <InfoBlock label="Market" value={market.name} /> : null}
          {dealer ? <InfoBlock label="Dealer" value={dealer.name} /> : null}
          {model ? <InfoBlock label="Model" value={model.name} /> : null}
          {engine ? <InfoBlock label="Engine" value={engine.name} /> : null}
          {transmission ? <InfoBlock label="Transmission" value={transmission.name} /> : null}
          {trim ? <InfoBlock label="Trim level" value={trim.name} /> : null}
        </div>
      </Card>

      <div className="space-y-3">
        {configuration.exteriorOptions.length > 0 ? (
          <Card className="border-slate-600 bg-slate-700/30 p-4">
            <SectionTitle title="Exterior options" />
            <div className="space-y-2">
              {configuration.exteriorOptions.map((optionId) => {
                const option = getExteriorOptionById(optionId);
                return option ? <PriceLine key={optionId} label={option.name} value={option.priceModifier} /> : null;
              })}
            </div>
          </Card>
        ) : null}

        {configuration.interiorOptions.length > 0 ? (
          <Card className="border-slate-600 bg-slate-700/30 p-4">
            <SectionTitle title="Interior options" />
            <div className="space-y-2">
              {configuration.interiorOptions.map((optionId) => {
                const option = getInteriorOptionById(optionId);
                return option ? <PriceLine key={optionId} label={option.name} value={option.priceModifier} /> : null;
              })}
            </div>
          </Card>
        ) : null}

        {configuration.wheels ? (
          <Card className="border-slate-600 bg-slate-700/30 p-4">
            <SectionTitle title="Wheels" />
            <PriceLine label={getWheelById(configuration.wheels)?.name ?? "Wheels"} value={getWheelById(configuration.wheels)?.priceModifier ?? 0} />
          </Card>
        ) : null}

        {configuration.packages.length > 0 ? (
          <Card className="border-slate-600 bg-slate-700/30 p-4">
            <SectionTitle title="Packages" />
            <div className="space-y-2">
              {configuration.packages.map((packageId) => {
                const pkg = getPackageById(packageId);
                return pkg ? <PriceLine key={packageId} label={pkg.name} value={pkg.priceModifier} /> : null;
              })}
            </div>
          </Card>
        ) : null}
      </div>

      <Card className="border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 p-6">
        {price.dealerDiscount > 0 ? (
          <div className="mb-4 flex items-center justify-between border-b border-slate-700/60 pb-4 text-sm">
            <span className="text-slate-300">{price.dealerDiscountLabel ?? "Dealer incentive"}</span>
            <span className="font-semibold text-emerald-300">-{formatCurrency(price.dealerDiscount)}</span>
          </div>
        ) : null}

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-xs uppercase tracking-wider text-slate-400">Estimated total</p>
            <p className="text-3xl font-bold text-cyan-400">{formatCurrency(price.totalPrice)}</p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>Ready to proceed?</p>
            <p>Click complete to save this build.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-xs uppercase text-slate-500">{label}</p>
      <p className="text-base font-semibold text-slate-100">{value}</p>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <p className="mb-3 text-xs font-semibold uppercase text-slate-300">{title}</p>;
}

function PriceLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-300">{label}</span>
      <span className="text-cyan-400">+{formatCurrency(value)}</span>
    </div>
  );
}