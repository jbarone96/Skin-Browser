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
    <div className="overflow-hidden rounded-[24px] border border-fuchsia-400/10 bg-[linear-gradient(180deg,rgba(36,7,84,0.96)_0%,rgba(18,17,40,0.98)_100%)] p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="rounded-full bg-black/25 px-2 py-1 text-[11px] font-semibold text-white/75">
          ${skin.price.toFixed(2)}
        </span>

        <span className="rounded-full bg-black/25 px-2 py-1 text-[11px] font-semibold text-white/75">
          {getWearShort(skin.wear)}
        </span>
      </div>

      <div className="mb-3 flex min-h-[112px] items-center justify-center">
        <img
          src={skin.image}
          alt={`${skin.weapon} | ${skin.name}`}
          className="max-h-[108px] w-auto object-contain"
          loading="lazy"
        />
      </div>

      <div>
        <p className="text-lg font-semibold leading-tight text-white">
          {skin.weapon}
        </p>
        <p className="mt-1 text-sm font-medium text-white/85">{skin.name}</p>
      </div>

      <div className="mt-4 space-y-2">
        <div className="rounded-xl bg-white/8 px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">
            Float Value
          </p>
          <p className="mt-1 text-sm font-semibold text-white">
            {formatFloat12(skin.float)}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-white/45">
            {skin.collection}
          </span>

          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
