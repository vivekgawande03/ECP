"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  areConfigurationVersionsEqual,
  getConfigurationVersionEntries,
} from "@/lib/configurator/versioning";
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
import { trpc } from "@/trpc/react";

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
  const currentVersions = useConfigurationStore((state) => state.currentVersions);
  const activeQuoteId = useConfigurationStore((state) => state.activeQuoteId);
  const calculatePrice = useConfigurationStore((state) => state.calculatePrice);
  const activeQuoteQuery = trpc.quote.getById.useQuery(
    { id: activeQuoteId ?? "" },
    {
      enabled: Boolean(activeQuoteId),
    },
  );
  const price = calculatePrice();

  const market = getMarketById(configuration.market);
  const dealer = getDealerById(configuration.dealer);
  const model = configuration.modelId ? getModelById(configuration.modelId) : null;
  const engine = configuration.engineId ? getEngineById(configuration.engineId) : null;
  const transmission = configuration.transmissionId
    ? getTransmissionById(configuration.transmissionId)
    : null;
  const trim = configuration.trimId ? getTrimById(configuration.trimId) : null;
  const activeQuote = activeQuoteQuery.data ?? null;
  const activeQuoteIsCurrent = activeQuote
    ? areConfigurationVersionsEqual(activeQuote.versions, currentVersions)
    : true;

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
          {price.dealerDiscount > 0 ? (
            <PriceRow
              label={price.dealerDiscountLabel ?? "Dealer incentive"}
              value={price.dealerDiscount}
              isDiscount
            />
          ) : null}
        </div>
        <div className="flex items-end justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Total</span>
          <p className="text-2xl font-bold text-cyan-400">{formatCurrency(price.totalPrice)}</p>
        </div>
      </Card>

      {activeQuote ? (
        <Card className="border-slate-600 bg-slate-700/30 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Loaded Quote</h4>
              <p className="mt-2 text-sm font-semibold text-white">{activeQuote.id}</p>
              <p className="mt-1 text-xs text-slate-500">{formatQuoteTimestamp(activeQuote.savedAt)}</p>
            </div>

            <span
              className={[
                "rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider",
                activeQuoteIsCurrent
                  ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border border-amber-500/30 bg-amber-500/10 text-amber-200",
              ].join(" ")}
            >
              {activeQuoteIsCurrent ? "Current" : "Older"}
            </span>
          </div>

          <div className="mt-4 border-t border-slate-600/40 pt-3">
            {getConfigurationVersionEntries(activeQuote.versions).map(({ label, value }) => (
              <SummaryRow key={label} label={label} value={value} />
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function formatQuoteTimestamp(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function PriceRow({
  label,
  value,
  isDiscount = false,
}: {
  label: string;
  value: number;
  isDiscount?: boolean;
}) {
  return (
    <div className="flex justify-between text-slate-400">
      <span>{label}</span>
      <span className={isDiscount ? "text-emerald-300" : "text-slate-300"}>
        {isDiscount ? `-${formatCurrency(value)}` : formatCurrency(value)}
      </span>
    </div>
  );
}