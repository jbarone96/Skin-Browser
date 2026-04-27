import type { TradeupSkin } from "../types/tradeup";
import { getWearShort } from "../utils/tradeup";

interface TradeupSelectedCardProps {
  skin: TradeupSkin;
  onRemove: () => void;
  onDuplicate: () => void;
  onFloatChange: (nextFloat: number) => void;
}

export default function TradeupSelectedCard({
  skin,
  onRemove,
  onDuplicate,
  onFloatChange,
}: TradeupSelectedCardProps) {
  return (
    <div
      className="group flex min-h-[280px] flex-col overflow-hidden rounded-[18px] border p-3"
      style={{
        borderColor: `${skin.rarityColor}33`,
        background: `linear-gradient(180deg, ${skin.rarityColor}35 0%, rgba(15,18,42,0.95) 100%)`,
      }}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="rounded-full bg-black/25 px-2 py-1 text-[10px] font-semibold text-white/80">
          ${skin.price.toFixed(2)}
        </span>

        <span className="rounded-full bg-black/25 px-2 py-1 text-[10px] font-semibold text-white/80">
          {getWearShort(skin.wear)}
        </span>
      </div>

      <div className="flex h-[112px] items-center justify-center">
        <img
          src={skin.image}
          alt={`${skin.weapon} | ${skin.name}`}
          className="max-h-[104px] w-auto object-contain transition duration-200 group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>

      <div className="mt-auto">
        <p className="truncate text-sm font-semibold text-white">
          {skin.weapon}
        </p>

        <p className="mt-1 truncate text-xs font-medium text-white/80">
          {skin.name}
        </p>

        <p className="mt-1 truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">
          {skin.collection}
        </p>

        <label className="mt-3 block">
          <span className="mb-1 block text-[9px] font-bold uppercase tracking-[0.14em] text-white/35">
            Float
          </span>

          <input
            type="number"
            min={0}
            max={1}
            step={0.000000000001}
            value={skin.float}
            onChange={(event) => {
              const nextValue = Number(event.target.value);

              if (Number.isNaN(nextValue)) return;

              onFloatChange(Math.min(Math.max(nextValue, 0), 1));
            }}
            className="w-full rounded-lg border border-white/10 bg-white/10 px-2 py-1.5 text-[10px] font-semibold text-white outline-none transition focus:border-cyan-300/50 focus:bg-white/[0.14]"
          />
        </label>

        <div className="mt-3 grid grid-cols-[42px_minmax(0,1fr)] gap-2">
          <button
            type="button"
            onClick={onDuplicate}
            className="rounded-lg bg-white/10 px-2 py-2 text-xs text-white transition hover:bg-cyan-500/20 hover:text-cyan-200"
            title="Duplicate"
            aria-label={`Duplicate ${skin.weapon} ${skin.name}`}
          >
            📄
          </button>

          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg bg-white/10 px-2 py-2 text-xs font-semibold text-white transition hover:bg-red-500/20 hover:text-red-200"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
