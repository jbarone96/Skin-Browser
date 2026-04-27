import type { TradeupCalculationResult } from "../types/tradeup";
import { formatFloat12 } from "../utils/tradeup";
import TradeupOutcomeCard from "./TradeupOutcomeCard";

interface TradeupOutcomesProps {
  calculation: TradeupCalculationResult;
}

function StatCard({
  label,
  value,
  valueClassName = "text-white",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
        {label}
      </p>
      <p className={`mt-1 text-lg font-semibold ${valueClassName}`}>{value}</p>
    </div>
  );
}

export default function TradeupOutcomes({ calculation }: TradeupOutcomesProps) {
  const { isValid, message, outcomes, summary } = calculation;
  const uniqueOutcomes = outcomes.filter((outcome, index, array) => {
    const key = `${outcome.skin.id}-${outcome.outputWear}-${outcome.outputFloat}`;

    return (
      array.findIndex(
        (item) =>
          `${item.skin.id}-${item.outputWear}-${item.outputFloat}` === key,
      ) === index
    );
  });

  return (
    <aside className="rounded-[28px] border border-white/10 bg-black/20 p-4 sm:p-5">
      <div className="mb-5">
        <h2 className="text-2xl font-semibold tracking-tight text-white">
          Outcomes
        </h2>
        <p className="mt-1 text-sm font-medium text-white/50">
          Expected value, odds, and possible returns.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Avg Float"
          value={formatFloat12(summary.averageFloat)}
        />
        <StatCard label="Cost" value={`$${summary.totalCost.toFixed(2)}`} />
        <StatCard
          label="Profit Chance"
          value={`${summary.profitChance.toFixed(2)}%`}
        />
        <StatCard
          label="Profitability"
          value={`${summary.profitabilityPercent.toFixed(2)}%`}
          valueClassName={
            summary.profitabilityPercent >= 100
              ? "text-emerald-300"
              : summary.profitabilityPercent >= 90
                ? "text-amber-300"
                : "text-red-300"
          }
        />
        <StatCard
          label="Avg Profit"
          value={`${summary.averageProfit >= 0 ? "+" : "-"}$${Math.abs(
            summary.averageProfit,
          ).toFixed(2)}`}
          valueClassName={
            summary.averageProfit >= 0 ? "text-emerald-300" : "text-red-300"
          }
        />
        <StatCard
          label="Avg Return"
          value={`$${summary.expectedValue.toFixed(2)}`}
        />
      </div>

      <div className="mt-5">
        {!isValid ? (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-5 py-10 text-center">
            <p className="text-sm font-semibold leading-6 text-white">
              {message}
            </p>
          </div>
        ) : (
          <div className="custom-scrollbar grid max-h-[calc(100vh-430px)] grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 overflow-y-auto pr-1">
            {uniqueOutcomes.map((outcome, index) => (
              <TradeupOutcomeCard
                key={outcome.id}
                outcome={outcome}
                isBest={index === 0}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
