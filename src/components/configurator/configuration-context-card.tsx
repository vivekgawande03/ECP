"use client";

import { Card } from "@/components/ui/card";
import { dealers, markets } from "@/lib/configurator/mock-data";
import type { DealerId, MarketId } from "@/lib/configurator/types";
import { useConfigurationStore } from "@/store/configuration-store";

export function ConfigurationContextCard() {
  const market = useConfigurationStore((state) => state.configuration.market);
  const dealer = useConfigurationStore((state) => state.configuration.dealer);
  const setMarket = useConfigurationStore((state) => state.setMarket);
  const setDealer = useConfigurationStore((state) => state.setDealer);

  return (
    <Card className="border-cyan-500/20 bg-slate-900/70 p-4">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-400/80">Sales context</p>
        <h2 className="mt-2 text-lg font-semibold text-white">Market & dealer context</h2>
        <p className="mt-1 text-sm text-slate-400">
          Set the commercial context for this configuration before walking through the build.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Market</span>
          <select
            value={market}
            onChange={(event) => setMarket(event.target.value as MarketId)}
            className="h-11 w-full rounded-xl border border-slate-600 bg-slate-800 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
          >
            {markets.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Dealer</span>
          <select
            value={dealer}
            onChange={(event) => setDealer(event.target.value as DealerId)}
            className="h-11 w-full rounded-xl border border-slate-600 bg-slate-800 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
          >
            {dealers.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </Card>
  );
}