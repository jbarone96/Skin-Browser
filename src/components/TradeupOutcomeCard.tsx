import type { TradeupCalculatedOutcome } from "../types/tradeup";
import { formatFloat12, getWearShort } from "../utils/tradeup";

interface TradeupOutcomeCardProps {
  outcome: TradeupCalculatedOutcome;
  isBest?: boolean;
}

function getToneClasses(profit: number) {
  if (profit > 0) {
    return {
      card: "border-emerald-400/20 bg-[linear-gradient(180deg,rgba(6,78,59,0.72)_0%,rgba(15,18,42,0.98)_100%)]",
      profit: "text-emerald-300",
      pill: "bg-emerald-500/20 text-emerald-100",
    };
  }

  if (profit > -0.5) {
    return {
      card: "border-amber-400/20 bg-[linear-gradient(180deg,rgba(120,53,15,0.72)_0%,rgba(15,18,42,0.98)_100%)]",
      profit: "text-amber-300",
      pill: "bg-amber-500/20 text-amber-100",
    };
  }

  return {
    card: "border-red-400/20 bg-[linear-gradient(180deg,rgba(127,29,29,0.72)_0%,rgba(15,18,42,0.98)_100%)]",
    profit: "text-red-300",
    pill: "bg-red-500/20 text-red-100",
  };
}

export default function TradeupOutcomeCard({
  outcome,
  isBest = false,
}: TradeupOutcomeCardProps) {
  const tone = getToneClasses(outcome.profit);

  return (
    <article
      className={`overflow-hidden rounded-[22px] border p-3 ${tone.card}`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-1 text-[11px] font-semibold ${tone.pill}`}
          >
            {(outcome.probability * 100).toFixed(2)}%
          </span>

          {isBest && (
            <span className="rounded-full bg-white/12 px-2 py-1 text-[11px] font-semibold text-white">
              BEST
            </span>
          )}
        </div>

        <span className={`text-xs font-semibold ${tone.profit}`}>
          {outcome.profit >= 0 ? "+" : "-"}$
          {Math.abs(outcome.profit).toFixed(2)}
        </span>
      </div>

      <div className="grid grid-cols-[92px_minmax(0,1fr)] items-center gap-3">
        <div className="flex h-[92px] items-center justify-center">
          <img
            src={outcome.skin.image}
            alt={`${outcome.skin.weapon} | ${outcome.skin.name}`}
            className="max-h-[86px] w-auto object-contain"
            loading="lazy"
          />
        </div>

        <div className="min-w-0">
          <p className="truncate text-base font-semibold leading-tight text-white">
            {outcome.skin.weapon}
          </p>

          <p className="mt-1 truncate text-sm font-medium text-white/85">
            {outcome.skin.name}
          </p>

          <p className="mt-1 text-xs font-semibold text-white/70">
            {getWearShort(outcome.outputWear)}{" "}
            {formatFloat12(outcome.outputFloat)}
          </p>

          <div className="mt-3 rounded-xl bg-black/25 px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-xs font-medium text-white/50">
                {outcome.skin.collection}
              </span>

              <span className="shrink-0 text-sm font-semibold text-white">
                ${outcome.marketPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
