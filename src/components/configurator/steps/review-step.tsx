"use client";

import { Button } from "@/components/ui/button";
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
import { getRuleNotes } from "@/lib/configurator/rules";
import { formatCurrency } from "@/lib/utils";
import { useConfigurationStore } from "@/store/configuration-store";

export function ReviewStep() {
  const configuration = useConfigurationStore((state) => state.configuration);
  const warnings = useConfigurationStore((state) => state.warnings);
  const savedQuotes = useConfigurationStore((state) => state.savedQuotes);
  const activeQuoteId = useConfigurationStore((state) => state.activeQuoteId);
  const saveQuote = useConfigurationStore((state) => state.saveQuote);
  const loadQuote = useConfigurationStore((state) => state.loadQuote);
  const loadLatestQuote = useConfigurationStore((state) => state.loadLatestQuote);
  const calculatePrice = useConfigurationStore((state) => state.calculatePrice);
  const price = calculatePrice();
  const ruleNotes = getRuleNotes(configuration);

  const market = getMarketById(configuration.market);
  const dealer = getDealerById(configuration.dealer);
  const model = configuration.modelId ? getModelById(configuration.modelId) : null;
  const engine = configuration.engineId ? getEngineById(configuration.engineId) : null;
  const transmission = configuration.transmissionId ? getTransmissionById(configuration.transmissionId) : null;
  const trim = configuration.trimId ? getTrimById(configuration.trimId) : null;
  const activeQuote = savedQuotes.find((quote) => quote.id === activeQuoteId) ?? null;
  const recentQuotes = savedQuotes.slice(0, 3);

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

      <Card className="border-slate-600 bg-slate-700/30 p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-100">Quote workflow</h3>
            <p className="mt-2 text-sm text-slate-400">
              Save this build locally for the demo, then reload any saved quote snapshot instantly.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row xl:flex-shrink-0">
            <Button className="whitespace-nowrap" onClick={() => saveQuote()}>
              Save quote
            </Button>
            <Button
              className="whitespace-nowrap"
              variant="outline"
              onClick={() => loadLatestQuote()}
              disabled={savedQuotes.length === 0}
            >
              Load latest quote
            </Button>
          </div>
        </div>

        {activeQuote ? (
          <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-700/60 pt-5 md:grid-cols-3">
            <InfoBlock label="Quote ID" value={activeQuote.id} />
            <InfoBlock label="Saved at" value={formatQuoteTimestamp(activeQuote.savedAt)} />
            <InfoBlock label="Quoted total" value={formatCurrency(activeQuote.price.totalPrice)} />
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-600 bg-slate-800/40 px-4 py-4 text-sm text-slate-400">
            This configuration is not saved yet. Save it now so the final screen can present a quote ID.
          </div>
        )}

        {recentQuotes.length > 0 ? (
          <div className="mt-5 space-y-3 border-t border-slate-700/60 pt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Recent saved quotes</p>

            {recentQuotes.map((quote) => {
              const quoteMarket = getMarketById(quote.market);
              const quoteDealer = getDealerById(quote.dealer);
              const isLoaded = quote.id === activeQuoteId;

              return (
                <div
                  key={quote.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-700 bg-slate-800/50 px-4 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{quote.id}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {quoteMarket?.name ?? quote.market} • {quoteDealer?.name ?? quote.dealer} • {formatQuoteTimestamp(quote.savedAt)}
                    </p>
                    <p className="mt-1 text-xs text-cyan-300">{formatCurrency(quote.price.totalPrice)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isLoaded ? (
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
                        Loaded
                      </span>
                    ) : null}
                    <Button variant="secondary" size="sm" onClick={() => loadQuote(quote.id)}>
                      Load quote
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </Card>

      {warnings.length > 0 || ruleNotes.length > 0 ? (
        <Card className="border-slate-600 bg-slate-700/30 p-6">
          <SectionTitle title="Rule notes and adjustments" />
          <div className="space-y-3">
            {warnings.map((warning) => (
              <div
                key={warning.id}
                className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
              >
                {warning.message}
              </div>
            ))}

            {ruleNotes.map((note) => (
              <div
                key={note.id}
                className="rounded-2xl border border-slate-600 bg-slate-800/50 px-4 py-3"
              >
                <p className="text-sm font-semibold text-white">{note.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-300">{note.detail}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

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
        {activeQuote ? (
          <div className="mb-4 flex items-center justify-between border-b border-slate-700/60 pb-4 text-sm">
            <span className="text-slate-300">Current quote ID</span>
            <span className="font-semibold text-white">{activeQuote.id}</span>
          </div>
        ) : null}

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
            <p>{activeQuote ? "Click complete to present the saved quote." : "Click complete to auto-save this build."}</p>
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

function formatQuoteTimestamp(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}