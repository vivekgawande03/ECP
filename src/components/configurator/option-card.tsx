import { Card } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";

type OptionCardProps = {
  name: string;
  description: string;
  price: number;
  isSelected: boolean;
  onClick: () => void;
  isDisabled?: boolean;
  disabledReason?: string;
  color?: string;
  priceLabel?: string;
};

export function OptionCard({
  name,
  description,
  price,
  isSelected,
  onClick,
  isDisabled = false,
  disabledReason,
  color,
  priceLabel,
}: OptionCardProps) {
  const resolvedPriceLabel = priceLabel ?? (price === 0 ? "Included" : `+${formatCurrency(price)}`);

  return (
    <Card
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      onClick={isDisabled ? undefined : onClick}
      onKeyDown={(event) => {
        if (isDisabled) {
          return;
        }

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      title={disabledReason}
      aria-disabled={isDisabled}
      className={cn(
        "relative overflow-hidden p-4 transition-all duration-200",
        isDisabled
          ? "cursor-not-allowed border-slate-700 bg-slate-800/40 opacity-60"
          : "cursor-pointer hover:border-slate-500 hover:bg-slate-800",
        isSelected && "border-cyan-500 bg-slate-800 ring-1 ring-cyan-500/30 shadow-lg shadow-cyan-500/10",
      )}
    >
      {color ? (
        <div
          className="absolute -right-8 -top-8 h-20 w-20 rounded-full opacity-20 blur-xl"
          style={{ backgroundColor: color }}
        />
      ) : null}

      <div className="relative z-10 flex gap-4">
        {color ? (
          <div
            className="h-12 w-12 flex-shrink-0 rounded-lg border border-slate-600"
            style={{ backgroundColor: color }}
          />
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-100">{name}</h3>
            {isSelected ? (
              <svg className="h-4 w-4 flex-shrink-0 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : null}
          </div>

          <p className="mb-2 text-xs leading-5 text-slate-400">{description}</p>
          <p className={cn("text-xs font-semibold", price === 0 ? "text-emerald-400" : "text-cyan-400")}>
            {resolvedPriceLabel}
          </p>

          {isDisabled && disabledReason ? (
            <p className="mt-2 text-[11px] text-amber-300">{disabledReason}</p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}