import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface OptionCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  isSelected: boolean;
  isDisabled?: boolean;
  disabledReason?: string;
  color?: string;
  onClick: () => void;
}

export function OptionCard({
  id,
  name,
  description,
  price,
  isSelected,
  isDisabled = false,
  disabledReason,
  color,
  onClick,
}: OptionCardProps) {
  const priceText =
    price === 0 ? 'Included' : `+$${price.toLocaleString()}`;

  return (
    <Card
      onClick={!isDisabled ? onClick : undefined}
      className={cn(
        'p-4 transition-all duration-200 cursor-pointer relative overflow-hidden',
        isDisabled
          ? 'bg-slate-800/50 border-slate-700 cursor-not-allowed opacity-50'
          : isSelected
            ? 'bg-slate-800 border-cyan-500 ring-1 ring-cyan-500/30 shadow-lg shadow-cyan-500/10'
            : 'bg-slate-800 border-slate-700 hover:border-slate-600 hover:shadow-lg hover:shadow-slate-900/50'
      )}
      title={disabledReason}
    >
      {/* Background accent for color options */}
      {color && (
        <div
          className="absolute -right-8 -top-8 w-20 h-20 rounded-full opacity-20 blur-lg"
          style={{ backgroundColor: color }}
        />
      )}

      <div className="relative z-10 flex gap-4">
        {/* Color preview if applicable */}
        {color && (
          <div
            className="w-12 h-12 rounded-lg border border-slate-600 flex-shrink-0"
            style={{ backgroundColor: color }}
          />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-semibold text-slate-100 truncate">{name}</h3>
            {isSelected && (
              <div className="flex-shrink-0">
                <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-400 line-clamp-2 mb-2">{description}</p>
          <p
            className={cn(
              'text-xs font-semibold',
              price === 0 ? 'text-green-400' : 'text-cyan-400'
            )}
          >
            {priceText}
          </p>
        </div>
      </div>

      {/* Disabled overlay with reason */}
      {isDisabled && disabledReason && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded px-3 py-2 max-w-xs">
            <p className="text-xs text-slate-300">{disabledReason}</p>
          </div>
        </div>
      )}
    </Card>
  );
}
