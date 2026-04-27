import type { TradeupCalculatedOutcome } from "../types/tradeup";
import { formatFloat12, getWearShort } from "../utils/tradeup";

interface TradeupOutcomeCardProps {
  outcome: TradeupCalculatedOutcome;
  isBest?: boolean;
}

function getToneClasses(profit: number) {
  if (profit > 0) {
    return {
      border: "rgba(52,211,153,0.3)",
      gradientTop: "rgba(6,78,59,0.72)",
      profit: "text-emerald-300",
      pill: "bg-emerald-500/20 text-emerald-100",
    };
  }

  if (profit > -0.5) {
    return {
      border: "rgba(251,191,36,0.3)",
      gradientTop: "rgba(120,53,15,0.72)",
      profit: "text-amber-300",
      pill: "bg-amber-500/20 text-amber-100",
    };
  }

  return {
    border: "rgba(248,113,113,0.3)",
    gradientTop: "rgba(127,29,29,0.72)",
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
      className="group relative flex min-h-[176px] flex-col overflow-hidden rounded-[22px] border p-4"
      style={{
        borderColor: tone.border,
        background: `linear-gradient(180deg, ${tone.gradientTop} 0%, rgba(18,17,40,0.96) 100%)`,
      }}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="rounded-full bg-black/25 px-2 py-1 text-[11px] font-semibold text-white/85">
          ${outcome.marketPrice.toFixed(2)}
        </span>

        <span
          className={`rounded-full bg-black/25 px-2 py-1 text-[11px] font-semibold ${tone.profit}`}
        >
          {outcome.profit >= 0 ? "+" : "-"}$
          {Math.abs(outcome.profit).toFixed(2)}
        </span>
      </div>

      <div className="mb-3 flex min-h-[98px] items-center justify-center">
        <img
          src={outcome.skin.image}
          alt={`${outcome.skin.weapon} | ${outcome.skin.name}`}
          className="max-h-[96px] w-auto object-contain transition duration-200 group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>

      <div className="mt-auto pr-12">
        <div className="mb-2 flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-1 text-[10px] font-semibold ${tone.pill}`}
          >
            {(outcome.probability * 100).toFixed(2)}%
          </span>

          {isBest ? (
            <span className="rounded-full bg-white/12 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white">
              Best
            </span>
          ) : null}
        </div>

        <p className="text-base font-semibold leading-tight text-white">
          {outcome.skin.weapon}
        </p>

        <p className="mt-1 text-sm font-medium text-white/85">
          {outcome.skin.name}
        </p>

        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">
          {formatFloat12(outcome.outputFloat)}
        </p>
      </div>

      <div className="absolute bottom-3 right-3">
        <span className="rounded-full bg-black/40 px-3 py-1 text-[11px] font-semibold text-white/80 backdrop-blur">
          {getWearShort(outcome.outputWear)}
        </span>
      </div>
    </article>
  );
}
