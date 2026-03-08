"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
import { calculateConfigurationPrice } from "@/lib/configurator/pricing";
import { formatCurrency } from "@/lib/utils";
import { useConfigurationStore } from "@/store/configuration-store";
import { trpc } from "@/trpc/react";

function getOrderPathStages(isCommitmentSubmitted: boolean) {
  return [
    {
      title: "Configuration locked",
      detail: "The selected vehicle, packages, and pricing have been captured as the current build.",
      status: "complete" as const,
    },
    {
      title: "Dealer review",
      detail: "Sales operations confirm the quote, customer details, and market/dealer assignment.",
      status: "complete" as const,
    },
    {
      title: "Production commitment",
      detail: "A provisional production slot is reserved for this configuration.",
      status: isCommitmentSubmitted ? ("complete" as const) : ("current" as const),
    },
    {
      title: "Factory scheduling",
      detail: "Plant scheduling, logistics sequencing, and supplier readiness are shown as the next stage.",
      status: isCommitmentSubmitted ? ("current" as const) : ("upcoming" as const),
    },
    {
      title: "Delivery planning",
      detail: "The dealer receives the committed build window and estimated handover timeframe.",
      status: "upcoming" as const,
    },
  ];
}

export function OrderSummaryPage() {
  const [isHydrated, setIsHydrated] = useState(useConfigurationStore.persist.hasHydrated());
  const [isCommitmentChecked, setIsCommitmentChecked] = useState(false);
  const configuration = useConfigurationStore((state) => state.configuration);
  const activeQuoteId = useConfigurationStore((state) => state.activeQuoteId);
  const utils = trpc.useUtils();
  const quoteQuery = trpc.quote.getById.useQuery(
    { id: activeQuoteId ?? "" },
    {
      enabled: Boolean(activeQuoteId),
    },
  );
  const commitMutation = trpc.quote.commit.useMutation({
    onSuccess: (quote) => {
      void Promise.all([
        utils.quote.getById.invalidate({ id: quote.id }),
        utils.quote.list.invalidate(),
        utils.quote.getLatest.invalidate(),
      ]);
      setIsCommitmentChecked(false);
    },
  });

  useEffect(() => {
    if (useConfigurationStore.persist.hasHydrated()) {
      setIsHydrated(true);
      return;
    }

    const rehydrateResult = useConfigurationStore.persist.rehydrate();

    if (rehydrateResult instanceof Promise) {
      void rehydrateResult.finally(() => {
        setIsHydrated(true);
      });
      return;
    }

    setIsHydrated(true);
  }, []);

  const activeQuote = commitMutation.data ?? quoteQuery.data ?? null;
  const activeConfiguration = activeQuote?.configuration ?? configuration;
  const price = activeQuote?.price ?? calculateConfigurationPrice(activeConfiguration);
  const market = getMarketById(activeConfiguration.market);
  const dealer = getDealerById(activeConfiguration.dealer);
  const model = activeConfiguration.modelId ? getModelById(activeConfiguration.modelId) : null;
  const engine = activeConfiguration.engineId ? getEngineById(activeConfiguration.engineId) : null;
  const transmission = activeConfiguration.transmissionId
    ? getTransmissionById(activeConfiguration.transmissionId)
    : null;
  const trim = activeConfiguration.trimId ? getTrimById(activeConfiguration.trimId) : null;
  const wheels = activeConfiguration.wheels ? getWheelById(activeConfiguration.wheels) : null;
  const exteriorSelections = activeConfiguration.exteriorOptions
    .map((optionId) => getExteriorOptionById(optionId))
    .filter((option): option is NonNullable<typeof option> => Boolean(option));
  const interiorSelections = activeConfiguration.interiorOptions
    .map((optionId) => getInteriorOptionById(optionId))
    .filter((option): option is NonNullable<typeof option> => Boolean(option));
  const packageSelections = activeConfiguration.packages
    .map((packageId) => getPackageById(packageId))
    .filter((pkg): pkg is NonNullable<typeof pkg> => Boolean(pkg));
  const isCommitmentSubmitted = Boolean(activeQuote?.productionCommitment);
  const commitmentTimestamp = activeQuote?.productionCommitment?.committedAt ?? null;
  const orderPathStages = getOrderPathStages(isCommitmentSubmitted);

  const productionPlan = useMemo(() => {
    const anchorDate = activeQuote ? new Date(activeQuote.savedAt) : new Date();
    const commitmentDate = new Date(anchorDate);
    commitmentDate.setDate(commitmentDate.getDate() + 14);

    const deliveryDate = new Date(anchorDate);
    deliveryDate.setDate(deliveryDate.getDate() + 56);

    return {
      orderReference: activeQuote?.id ?? buildDraftReference(model?.id, dealer?.id),
      productionMonth: commitmentDate.toLocaleString(undefined, {
        month: "long",
        year: "numeric",
      }),
      deliveryWindow: `${deliveryDate.toLocaleString(undefined, { month: "short" })} ${deliveryDate.getFullYear()}`,
      submittedAt: activeQuote ? formatTimestamp(activeQuote.savedAt) : "Draft configuration",
      committedAt: commitmentTimestamp ? formatTimestamp(commitmentTimestamp) : "Pending confirmation",
      nextMilestone: isCommitmentSubmitted ? "Factory scheduling" : "Production commitment",
    };
  }, [activeQuote, commitmentTimestamp, dealer?.id, isCommitmentSubmitted, model?.id]);

  if (!isHydrated) {
    return <OrderSummaryShell title="Loading order summary" description="Restoring your saved build details." />;
  }

  if (!model) {
    return (
      <OrderSummaryShell
        title="No saved build found"
        description="Complete a vehicle configuration first, then return here to review the order path and production commitment."
      >
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-cyan-500 px-5 py-2.5 font-medium text-slate-950 transition-colors hover:bg-cyan-600"
        >
          Go to configurator
        </Link>
      </OrderSummaryShell>
    );
  }

  const orderSku = buildOrderSku({
    modelId: model.id,
    trimId: trim?.id,
    engineId: engine?.id,
    transmissionId: transmission?.id,
    wheelId: wheels?.id,
    packageCount: packageSelections.length,
  });
  const orderSummary = buildOrderSummary({
    modelName: model.name,
    trimName: trim?.name,
    engineName: engine?.name,
    transmissionName: transmission?.name,
    wheelName: wheels?.name,
    packageCount: packageSelections.length,
  });

  if (isCommitmentSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-10 text-slate-100">
        <OrderConfirmationCard
          orderReference={productionPlan.orderReference}
          orderSku={orderSku}
          committedAt={productionPlan.committedAt}
          marketName={market?.name ?? activeConfiguration.market}
          dealerName={dealer?.name ?? activeConfiguration.dealer}
          orderSummary={orderSummary}
          totalValue={formatCurrency(price.totalPrice)}
          nextMilestone={productionPlan.nextMilestone}
          modelName={model.name}
          wheelsName={wheels?.name}
          packageCount={packageSelections.length}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">Order Path</p>
            <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Production commitment summary</h1>
          </div>

          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
            <p className="font-semibold">Order reference</p>
            <p className="mt-1 text-base font-bold text-white">{productionPlan.orderReference}</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
          <div className="space-y-6">
            <Card className="p-6 md:p-8">
              <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/15 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-100">
                Vehicle configuration
              </span>

              <h2 className="mt-5 text-2xl font-bold text-white">{model.name}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                Prepared for {dealer?.name ?? activeConfiguration.dealer} in {market?.name ?? activeConfiguration.market}.
                This saved build is now presented in a production-commitment format for dealer review.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-slate-700 bg-slate-900/50 px-4 py-1.5 text-xs font-medium text-slate-200">
                  Dealer · {dealer?.name ?? activeConfiguration.dealer}
                </span>
                <span className="rounded-full border border-slate-700 bg-slate-900/50 px-4 py-1.5 text-xs font-medium text-slate-200">
                  Market · {market?.name ?? activeConfiguration.market}
                </span>
                <span className="rounded-full border border-slate-700 bg-slate-900/50 px-4 py-1.5 text-xs font-medium text-slate-200">
                  Quote saved · {productionPlan.submittedAt}
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <VehicleSpecCard label="Model" value={model.name} />
                <VehicleSpecCard label="Engine" value={engine?.name ?? "Not selected"} />
                <VehicleSpecCard label="Transmission" value={transmission?.name ?? "Not selected"} />
                <VehicleSpecCard label="Trim" value={trim?.name ?? "Not selected"} />
              </div>

              <div className="my-6 h-px bg-slate-700/70" />

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Customizations</p>
                <div className="mt-5 space-y-5">
                  <CustomizationGroup
                    label="Exterior"
                    items={exteriorSelections.map((option) => option.name)}
                    emptyLabel="Standard exterior specification"
                    tone="exterior"
                  />
                  <CustomizationGroup
                    label="Interior"
                    items={interiorSelections.map((option) => option.name)}
                    emptyLabel="Standard interior specification"
                    tone="interior"
                  />
                  <CustomizationGroup
                    label="Wheels"
                    items={wheels ? [wheels.name] : []}
                    emptyLabel="Standard wheel specification"
                    tone="wheels"
                  />
                  <CustomizationGroup
                    label="Packages"
                    items={packageSelections.map((pkg) => pkg.name)}
                    emptyLabel="No package upgrades selected"
                    tone="packages"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">Production timeline</h2>
                </div>
                <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">
                  {isCommitmentSubmitted ? "Scheduling ready" : "Commitment stage"}
                </span>
              </div>

              <div className="mt-6 space-y-5">
                {orderPathStages.map((stage, index) => (
                  <TimelineStage key={stage.title} index={index + 1} totalStages={orderPathStages.length} {...stage} />
                ))}
              </div>
            </Card>

          </div>

          <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-white">Production commitment</h2>
              <div className="mt-5 space-y-4">
                <CommitmentStat label="Production month" value={productionPlan.productionMonth} />
                <CommitmentStat label="Delivery window" value={productionPlan.deliveryWindow} />
                <CommitmentStat
                  label="Allocation status"
                  value={isCommitmentSubmitted ? "Committed to scheduling" : "Reserved for dealer review"}
                />
                <CommitmentStat label="Order status" value={isCommitmentSubmitted ? "Committed" : "Awaiting confirmation"} />
                <CommitmentStat label="Committed at" value={productionPlan.committedAt} />
                <CommitmentStat label="Next milestone" value={productionPlan.nextMilestone} />
              </div>

              {!isCommitmentSubmitted ? (
                <label className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-950 text-cyan-400"
                    checked={isCommitmentChecked}
                    onChange={(event) => setIsCommitmentChecked(event.target.checked)}
                  />
                  <span>
                    By placing this order, you commit to the vehicle configuration and production timeline shown above.
                  </span>
                </label>
              ) : (
                <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-100">
                  Production commitment recorded and configuration locked for downstream factory scheduling.
                </div>
              )}

              <div className="mt-5 space-y-3">
                <Button
                  className="w-full"
                  onClick={() => {
                    if (activeQuote?.id) {
                      commitMutation.mutate({ id: activeQuote.id });
                    }
                  }}
                  disabled={!isCommitmentChecked || !activeQuote?.id || commitMutation.isPending || isCommitmentSubmitted}
                >
                  {isCommitmentSubmitted
                    ? "Production commitment confirmed"
                    : commitMutation.isPending
                      ? "Confirming production commitment..."
                      : "Confirm production commitment"}
                </Button>
                <Link
                  href="/"
                  className="inline-flex w-full items-center justify-center rounded-lg border border-slate-600 px-4 py-2.5 font-medium text-slate-100 transition-colors hover:bg-slate-700"
                >
                  Review configuration again
                </Link>
              </div>

              {!activeQuote?.id ? (
                <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                  Save the build as a quote first so the commitment can be recorded against an order reference.
                </div>
              ) : null}

              {commitMutation.error ? (
                <div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                  We couldn’t confirm the production commitment just now. Please try again.
                </div>
              ) : null}

            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">Price breakdown</h2>
                  <p className="mt-1 text-sm text-slate-400">Quote-backed when available, otherwise calculated from the current saved build.</p>
                </div>
                {quoteQuery.isLoading ? (
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Refreshing quote</span>
                ) : null}
              </div>

              <div className="mt-5 space-y-3">
                <PriceLine label="Base vehicle" value={price.basePrice} />
                <PriceLine label="Engine" value={price.enginePrice} />
                <PriceLine label="Transmission" value={price.transmissionPrice} />
                <PriceLine label="Trim" value={price.trimPrice} />
                <PriceLine label="Options" value={price.optionsPrice} />
                <PriceLine label="Packages" value={price.packagesPrice} />
                {price.dealerDiscount > 0 ? (
                  <PriceLine
                    label={price.dealerDiscountLabel ?? "Dealer incentive"}
                    value={-price.dealerDiscount}
                    tone="positive"
                  />
                ) : null}
              </div>

              <div className="mt-5 border-t border-slate-700/60 pt-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Total commitment value</p>
                    <p className="mt-2 text-3xl font-bold text-cyan-400">{formatCurrency(price.totalPrice)}</p>
                  </div>
                </div>
              </div>

              {quoteQuery.error ? (
                <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                  We couldn’t refresh the saved quote, so this summary is using the persisted configuration as fallback.
                </div>
              ) : null}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderConfirmationCard({
  orderReference,
  orderSku,
  committedAt,
  marketName,
  dealerName,
  orderSummary,
  totalValue,
  nextMilestone,
  modelName,
  wheelsName,
  packageCount,
}: {
  orderReference: string;
  orderSku: string;
  committedAt: string;
  marketName: string;
  dealerName: string;
  orderSummary: string;
  totalValue: string;
  nextMilestone: string;
  modelName: string;
  wheelsName?: string;
  packageCount: number;
}) {
  return (
    <Card className="w-full max-w-4xl border-emerald-500/20 bg-slate-900/80 p-8 text-center shadow-2xl">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
        <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      <h2 className="text-3xl font-bold text-white">Order Confirmed Successfully</h2>
      <p className="mt-3 text-sm text-slate-400">
        The production commitment has been recorded and this saved quote is now represented as a formal order confirmation for dealer
        and factory scheduling review.
      </p>

      <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5 text-left">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ConfirmationInfo label="Order ID" value={orderReference} />
          <ConfirmationInfo label="SKU" value={orderSku} />
          <ConfirmationInfo label="Committed at" value={committedAt} />
          <ConfirmationInfo label="Market" value={marketName} />
          <ConfirmationInfo label="Dealer" value={dealerName} />
          <ConfirmationInfo label="Order summary" value={orderSummary} />
        </div>

        <div className="mt-5 border-t border-slate-700/60 pt-4">
          <p className="text-xs uppercase tracking-wider text-slate-400">Total order value</p>
          <p className="mt-2 text-3xl font-bold text-cyan-400">{totalValue}</p>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs uppercase tracking-wider text-slate-400">Next milestone</p>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
              {nextMilestone}
            </span>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-300">
            {modelName} is now queued for dealer-to-factory scheduling with {wheelsName ?? "standard"} wheels and{" "}
            {packageCount > 0 ? `${packageCount} selected package${packageCount === 1 ? "" : "s"}` : "standard package content"}.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex w-full items-center justify-center rounded-lg border border-slate-600 px-4 py-2.5 font-medium text-slate-100 transition-colors hover:bg-slate-800"
        >
          Back to configurator
        </Link>
      </div>
    </Card>
  );
}

function OrderSummaryShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 text-slate-100">
      <Card className="w-full max-w-xl p-8 text-center">
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
        {children ? <div className="mt-6">{children}</div> : null}
      </Card>
    </div>
  );
}

function VehicleSpecCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-900/50 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-cyan-300/80">{label}</p>
      <p className="my-2 text-sm font-semibold leading-6 text-white">{value}</p>
    </div>
  );
}

function TimelineStage({
  index,
  totalStages,
  title,
  detail,
  status,
}: {
  index: number;
  totalStages: number;
  title: string;
  detail: string;
  status: "complete" | "current" | "upcoming";
}) {
  const statusClasses = {
    complete: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    current: "border-cyan-400/30 bg-cyan-400/10 text-cyan-100",
    upcoming: "border-slate-700 bg-slate-900/60 text-slate-300",
  };

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold ${statusClasses[status]}`}>
          {index}
        </div>
        {index !== totalStages ? <div className="mt-2 h-full w-px bg-slate-700" /> : null}
      </div>
      <div className="pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <span className={`rounded-full border px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${statusClasses[status]}`}>
            {status}
          </span>
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{detail}</p>
      </div>
    </div>
  );
}

function CustomizationGroup({
  label,
  items,
  emptyLabel,
  tone,
}: {
  label: string;
  items: string[];
  emptyLabel: string;
  tone: "exterior" | "interior" | "wheels" | "packages";
}) {
  const toneClasses = {
    exterior: "border-amber-400/30 bg-amber-400/10 text-amber-100",
    interior: "border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-100",
    wheels: "border-sky-400/30 bg-sky-400/10 text-sky-100",
    packages: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
  };

  return (
    <div className="grid gap-1 pb-2 last:border-b-0 last:pb-0 md:grid-cols-[140px_minmax(0,1fr)] md:gap-1">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.length > 0 ? (
          items.map((item) => (
            <span key={`${label}-${item}`} className={`rounded-full border px-4 py-1.5 text-sm font-medium ${toneClasses[tone]}`}>
              {item}
            </span>
          ))
        ) : (
          <span className="rounded-full border border-slate-700 bg-slate-900/70 px-4 py-1.5 text-sm text-slate-300">
            {emptyLabel}
          </span>
        )}
      </div>
    </div>
  );
}

function CommitmentStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="text-right font-semibold text-white">{value}</span>
    </div>
  );
}

function ConfirmationInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-6 text-white">{value}</p>
    </div>
  );
}

function PriceLine({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "positive";
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-slate-300">{label}</span>
      <span className={tone === "positive" ? "font-semibold text-emerald-300" : "font-semibold text-cyan-300"}>
        {value < 0 ? "-" : ""}
        {formatCurrency(Math.abs(value))}
      </span>
    </div>
  );
}

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function buildDraftReference(modelId?: string, dealerId?: string) {
  const modelCode = (modelId ?? "draft").replace(/[^a-z0-9]/gi, "").slice(0, 6).toUpperCase();
  const dealerCode = (dealerId ?? "dealer").replace(/[^a-z0-9]/gi, "").slice(0, 4).toUpperCase();

  return `${modelCode}-${dealerCode}`;
}

function buildOrderSku({
  modelId,
  trimId,
  engineId,
  transmissionId,
  wheelId,
  packageCount,
}: {
  modelId: string;
  trimId?: string;
  engineId?: string;
  transmissionId?: string;
  wheelId?: string;
  packageCount: number;
}) {
  return [
    "POC",
    createSkuSegment(modelId, 4),
    createSkuSegment(trimId, 3),
    createSkuSegment(engineId, 4),
    createSkuSegment(transmissionId, 4),
    createSkuSegment(wheelId, 3),
    `P${String(packageCount).padStart(2, "0")}`,
  ].join("-");
}

function buildOrderSummary({
  modelName,
  trimName,
  engineName,
  transmissionName,
  wheelName,
  packageCount,
}: {
  modelName: string;
  trimName?: string;
  engineName?: string;
  transmissionName?: string;
  wheelName?: string;
  packageCount: number;
}) {
  const packageSummary = packageCount > 0 ? `${packageCount} package${packageCount === 1 ? "" : "s"}` : "standard package set";

  return [
    modelName,
    trimName ?? "Standard trim",
    engineName ?? "Powertrain pending",
    transmissionName ?? "Transmission pending",
    wheelName ?? "Standard wheels",
    packageSummary,
  ].join(" · ");
}

function createSkuSegment(value: string | undefined, length: number) {
  const normalized = (value ?? "std").replace(/[^a-z0-9]/gi, "").toUpperCase();
  return normalized.slice(0, length).padEnd(length, "X");
}