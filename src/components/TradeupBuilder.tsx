import type { TradeupCalculationResult, TradeupSkin } from "../types/tradeup";
import TradeupOutcomes from "./TradeupOutcomes";
import TradeupSelectedCard from "./TradeupSelectedCard";

interface TradeupBuilderProps {
  selectedSkins: TradeupSkin[];
  calculation: TradeupCalculationResult;
  onRemoveSkin: (index: number) => void;
  onClearSkins: () => void;
}

export default function TradeupBuilder({
  selectedSkins,
  calculation,
  onRemoveSkin,
  onClearSkins,
}: TradeupBuilderProps) {
  const slots = Array.from(
    { length: 10 },
    (_, index) => selectedSkins[index] ?? null,
  );

  return (
    <section className="rounded-[28px] border border-white/10 bg-black/20 p-4 sm:p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            Tradeup
          </h2>

          <span className="rounded-full bg-fuchsia-500/20 px-3 py-1 text-xs font-semibold text-fuchsia-200">
            Restricted Tradeup
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white/75">
            {selectedSkins.length}/10 Selected
          </div>

          <button
            type="button"
            onClick={onClearSkins}
            disabled={selectedSkins.length === 0}
            className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
        {slots.map((skin, index) =>
          skin ? (
            <TradeupSelectedCard
              key={`${skin.id}-${index}`}
              skin={skin}
              onRemove={() => onRemoveSkin(index)}
            />
          ) : (
            <div
              key={`empty-slot-${index}`}
              className="flex min-h-[290px] items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] text-center"
            >
              <div>
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-2xl text-white/35">
                  +
                </div>
                <p className="mt-3 text-sm font-semibold text-white/45">
                  Add Skin
                </p>
              </div>
            </div>
          ),
        )}
      </div>

      <TradeupOutcomes calculation={calculation} />
    </section>
  );
}
