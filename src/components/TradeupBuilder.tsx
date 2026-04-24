import type { TradeupSkin } from "../types/tradeup";
import TradeupSelectedCard from "./TradeupSelectedCard";

interface TradeupBuilderProps {
  selectedSkins: TradeupSkin[];
  requiredInputCount: number;
  onRemoveSkin: (index: number) => void;
  onClearSkins: () => void;
}

export default function TradeupBuilder({
  selectedSkins,
  requiredInputCount,
  onRemoveSkin,
  onClearSkins,
}: TradeupBuilderProps) {
  const slots = Array.from(
    { length: requiredInputCount },
    (_, index) => selectedSkins[index] ?? null,
  );

  return (
    <section className="rounded-[28px] border border-white/10 bg-black/20 p-4 sm:p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Inputs
          </h2>
          <p className="mt-1 text-sm font-medium text-white/50">
            Add {requiredInputCount} skins to calculate outcomes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white/75">
            {selectedSkins.length}/{requiredInputCount}
          </div>

          <button
            type="button"
            onClick={onClearSkins}
            disabled={selectedSkins.length === 0}
            className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid max-h-[calc(100vh-210px)] grid-cols-1 gap-3 overflow-y-auto pr-1 2xl:grid-cols-2">
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
              className="flex min-h-[150px] items-center justify-center rounded-[22px] border border-dashed border-white/10 bg-white/[0.03] text-center"
            >
              <div>
                <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-xl text-white/35">
                  +
                </div>
                <p className="mt-2 text-sm font-semibold text-white/40">
                  Empty Slot
                </p>
              </div>
            </div>
          ),
        )}
      </div>
    </section>
  );
}
