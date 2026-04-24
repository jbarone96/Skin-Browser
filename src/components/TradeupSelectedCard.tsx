import type { TradeupSkin } from "../types/tradeup";
import { formatFloat12, getWearShort } from "../utils/tradeup";

interface TradeupSelectedCardProps {
  skin: TradeupSkin;
  onRemove: () => void;
}

export default function TradeupSelectedCard({
  skin,
  onRemove,
}: TradeupSelectedCardProps) {
  return (
    <div
      className="overflow-hidden rounded-[22px] border p-3"
      style={{
        borderColor: `${skin.rarityColor}33`,
        background: `linear-gradient(180deg, ${skin.rarityColor}35 0%, rgba(15,18,42,0.98) 100%)`,
      }}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="rounded-full bg-black/25 px-2 py-1 text-[11px] font-semibold text-white/75">
          ${skin.price.toFixed(2)}
        </span>

        <span className="rounded-full bg-black/25 px-2 py-1 text-[11px] font-semibold text-white/75">
          {getWearShort(skin.wear)}
        </span>
      </div>

      <div className="grid grid-cols-[92px_minmax(0,1fr)] items-center gap-3">
        <div className="flex h-[92px] items-center justify-center">
          <img
            src={skin.image}
            alt={`${skin.weapon} | ${skin.name}`}
            className="max-h-[86px] w-auto object-contain"
            loading="lazy"
          />
        </div>

        <div className="min-w-0">
          <p className="truncate text-base font-semibold leading-tight text-white">
            {skin.weapon}
          </p>
          <p className="mt-1 truncate text-sm font-medium text-white/85">
            {skin.name}
          </p>
          <p className="mt-1 truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45">
            {skin.rarity}
          </p>

          <div className="mt-3 rounded-xl bg-white/8 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">
              Float
            </p>
            <p className="mt-1 text-xs font-semibold text-white">
              {formatFloat12(skin.float)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="truncate text-xs font-medium text-white/45">
          {skin.collection}
        </span>

        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
