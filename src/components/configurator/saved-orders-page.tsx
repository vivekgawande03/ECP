"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { getDealerById, getMarketById, getModelById } from "@/lib/configurator/mock-data";
import type { SavedQuote } from "@/lib/configurator/types";
import { formatCurrency } from "@/lib/utils";
import { useConfigurationStore } from "@/store/configuration-store";
import { trpc } from "@/trpc/react";

type SavedOrder = SavedQuote & {
  productionCommitment: NonNullable<SavedQuote["productionCommitment"]>;
};

export function SavedOrdersPage() {
  const activeQuoteId = useConfigurationStore((state) => state.activeQuoteId);
  const applySavedQuote = useConfigurationStore((state) => state.applySavedQuote);
  const quotesQuery = trpc.quote.list.useQuery();
  const savedOrders = (quotesQuery.data ?? []).filter((quote): quote is SavedOrder => quote.productionCommitment !== null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-700 bg-slate-900/70 p-6 shadow-2xl sm:flex-row sm:items-end sm:justify-between sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-300">Saved orders</p>
            <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Committed orders</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              Saved quotes with a recorded production commitment are treated as orders. Open any order to review it in the production commitment summary.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              <p className="font-semibold">Orders available</p>
              <p className="mt-1 text-2xl font-bold text-white">{savedOrders.length}</p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-medium text-slate-100 transition-colors hover:bg-slate-700"
            >
              Back to configurator
            </Link>
          </div>
        </div>

        {quotesQuery.isLoading && savedOrders.length === 0 ? (
          <Card className="p-6 text-sm text-slate-300">Loading committed orders...</Card>
        ) : null}

        {quotesQuery.error ? (
          <Card className="border-amber-500/20 bg-amber-500/10 p-6 text-sm text-amber-100">
            We couldn’t load saved orders right now. Please try again in a moment.
          </Card>
        ) : null}

        {!quotesQuery.isLoading && !quotesQuery.error && savedOrders.length === 0 ? (
          <Card className="border-dashed p-10 text-center">
            <h2 className="text-xl font-semibold text-white">No saved orders yet</h2>
            <p className="mt-3 text-sm text-slate-400">
              Orders appear here after a saved quote receives a production commitment from the order summary flow.
            </p>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-lg bg-cyan-500 px-5 py-2.5 font-medium text-slate-950 transition-colors hover:bg-cyan-600"
              >
                Configure a vehicle
              </Link>
            </div>
          </Card>
        ) : null}

        {savedOrders.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {savedOrders.map((order) => {
              const model = order.configuration.modelId ? getModelById(order.configuration.modelId) : null;
              const market = getMarketById(order.market);
              const dealer = getDealerById(order.dealer);
              const isActiveOrder = activeQuoteId === order.id;

              return (
                <Card key={order.id} className="p-6">
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Order reference</p>
                        <h2 className="mt-2 text-xl font-bold text-white">{order.id}</h2>
                        <p className="mt-2 text-sm text-slate-400">
                          {model?.name ?? "Configured vehicle"} • {market?.name ?? order.market} • {dealer?.name ?? order.dealer}
                        </p>
                      </div>

                      <span className="inline-flex w-fit rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-200">
                        Committed order
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <OrderMeta label="Quote saved" value={formatTimestamp(order.savedAt)} />
                      <OrderMeta label="Committed at" value={formatTimestamp(order.productionCommitment.committedAt)} />
                      <OrderMeta label="Total value" value={formatCurrency(order.price.totalPrice)} />
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-slate-400">
                        Open this committed quote in the order summary to review production timing and status.
                      </p>

                      <Link
                        href="/order-summary"
                        onClick={() => applySavedQuote(order)}
                        className="inline-flex items-center justify-center rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-medium text-slate-950 transition-colors hover:bg-cyan-600"
                      >
                        {isActiveOrder ? "Open current order" : "Open order summary"}
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function OrderMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-100">{value}</p>
    </div>
  );
}

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}