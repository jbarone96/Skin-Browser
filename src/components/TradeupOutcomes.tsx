import type { TradeupCalculationResult } from "../types/tradeup";
import { formatFloat12 } from "../utils/tradeup";
import TradeupOutcomeCard from "./TradeupOutcomeCard";

interface TradeupOutcomesProps {
  calculation: TradeupCalculationResult;
}

function StatPill({
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
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">
        {label}
      </p>
      <p className={`mt-1 text-[1.05rem] font-semibold ${valueClassName}`}>
        {value}
      </p>
    </div>
  );
}

export default function TradeupOutcomes({ calculation }: TradeupOutcomesProps) {
  const { isValid, message, outcomes, summary } = calculation;

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-3xl font-semibold tracking-tight text-white">
          Outcomes
        </h3>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4 2xl:grid-cols-8">
        <StatPill
          label="Average Float"
          value={formatFloat12(summary.averageFloat)}
        />
        <StatPill label="Cost" value={`$${summary.totalCost.toFixed(2)}`} />
        <StatPill
          label="Profit Chances"
          value={`${summary.profitChance.toFixed(2)}%`}
        />
        <StatPill
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
        <StatPill
          label="Average Profit"
          value={`${summary.averageProfit >= 0 ? "+" : "-"}$${Math.abs(
            summary.averageProfit,
          ).toFixed(2)}`}
          valueClassName={
            summary.averageProfit >= 0 ? "text-emerald-300" : "text-red-300"
          }
        />
        <StatPill
          label="Average Return"
          value={`$${summary.expectedValue.toFixed(2)}`}
        />
        <StatPill
          label="Min Loss"
          value={
            summary.minLoss >= 0
              ? "$0.00"
              : `-$${Math.abs(summary.minLoss).toFixed(2)}`
          }
          valueClassName={summary.minLoss < 0 ? "text-red-300" : "text-white"}
        />
        <StatPill
          label="Max Loss"
          value={
            summary.maxLoss >= 0
              ? "$0.00"
              : `-$${Math.abs(summary.maxLoss).toFixed(2)}`
          }
          valueClassName={summary.maxLoss < 0 ? "text-red-300" : "text-white"}
        />
      </div>

      {!isValid ? (
        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-6 py-10 text-center">
          <p className="text-lg font-semibold text-white">{message}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
          {outcomes.map((outcome, index) => (
            <TradeupOutcomeCard
              key={outcome.id}
              outcome={outcome}
              isBest={index === 0}
            />
          ))}
        </div>
      )}
    </section>
  );
}
