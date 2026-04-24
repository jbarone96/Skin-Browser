import type { TradeupCalculatedOutcome } from "../types/tradeup";
import { formatFloat12, getWearShort } from "../utils/tradeup";

interface TradeupOutcomeCardProps {
  outcome: TradeupCalculatedOutcome;
  isBest?: boolean;
}

function getToneClasses(profit: number) {
  if (profit > 0) {
    return {
      card: "border-emerald-400/20 bg-[linear-gradient(180deg,rgba(6,78,59,0.95)_0%,rgba(4,47,46,0.98)_100%)]",
      profit: "text-emerald-300",
      pill: "bg-emerald-500/20 text-emerald-100",
      footer: "bg-black/28",
    };
  }

  if (profit > -0.5) {
    return {
      card: "border-amber-400/20 bg-[linear-gradient(180deg,rgba(120,53,15,0.95)_0%,rgba(68,35,12,0.98)_100%)]",
      profit: "text-amber-300",
      pill: "bg-amber-500/20 text-amber-100",
      footer: "bg-black/28",
    };
  }

  return {
    card: "border-red-400/20 bg-[linear-gradient(180deg,rgba(127,29,29,0.96)_0%,rgba(69,10,10,0.98)_100%)]",
    profit: "text-red-300",
    pill: "bg-white/12 text-white/90",
    footer: "bg-black/28",
  };
}

export default function TradeupOutcomeCard({
  outcome,
  isBest = false,
}: TradeupOutcomeCardProps) {
  const tone = getToneClasses(outcome.profit);

  return (
    <article
      className={`overflow-hidden rounded-[24px] border p-4 ${tone.card}`}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex flex-col gap-2">
          <span
            className={`w-fit rounded-full px-2 py-1 text-[11px] font-semibold ${tone.pill}`}
          >
            {(outcome.probability * 100).toFixed(2)}%
          </span>

          {isBest && (
            <span className="w-fit rounded-full bg-white/12 px-2 py-1 text-[11px] font-semibold text-white">
              BEST
            </span>
          )}
        </div>

        <span className={`text-sm font-semibold ${tone.profit}`}>
          {outcome.profit >= 0 ? "+" : "-"}$
          {Math.abs(outcome.profit).toFixed(2)}
        </span>
      </div>

      <div className="mb-4 flex min-h-[86px] items-center justify-center">
        <img
          src={outcome.skin.image}
          alt={`${outcome.skin.weapon} | ${outcome.skin.name}`}
          className="max-h-[84px] w-auto object-contain"
          loading="lazy"
        />
      </div>

      <div>
        <p className="text-[1.65rem] font-semibold leading-none tracking-tight text-white">
          {outcome.skin.weapon}
        </p>
        <p className="mt-2 text-base font-semibold text-white/90">
          {outcome.skin.name}
        </p>
        <p className="mt-2 text-sm font-semibold text-white/90">
          {getWearShort(outcome.outputWear)}{" "}
          {formatFloat12(outcome.outputFloat)}
        </p>
      </div>

      <div className={`mt-4 rounded-[16px] px-4 py-3 ${tone.footer}`}>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-white/55">
            {outcome.skin.collection}
          </span>

          <span className="text-lg font-semibold text-white">
            ${outcome.marketPrice.toFixed(2)}
          </span>
        </div>
      </div>
    </article>
  );
}
