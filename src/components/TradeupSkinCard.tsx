import type { TradeupSkin } from "../types/tradeup";
import { getWearShort } from "../utils/tradeup";

interface TradeupSkinCardProps {
  skin: TradeupSkin;
  isDisabled?: boolean;
  isSelected?: boolean;
  onAdd: (skin: TradeupSkin) => void;
}

export default function TradeupSkinCard({
  skin,
  isDisabled = false,
  isSelected = false,
  onAdd,
}: TradeupSkinCardProps) {
  return (
    <button
      type="button"
      onClick={() => onAdd(skin)}
      disabled={isDisabled}
      className={`group relative flex min-h-[176px] flex-col overflow-hidden rounded-[22px] border p-4 text-left transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${
        isSelected
          ? "ring-2 ring-cyan-300/80 shadow-[0_0_28px_rgba(103,232,249,0.22)]"
          : ""
      }`}
      style={{
        borderColor: isSelected
          ? "rgba(103,232,249,0.85)"
          : `${skin.rarityColor}33`,
        background: `linear-gradient(180deg, ${skin.rarityColor}55 0%, rgba(18,17,40,0.96) 100%)`,
      }}
    >
      {isSelected ? (
        <span className="absolute right-3 top-3 z-10 rounded-full bg-cyan-300 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-zinc-950">
          Selected
        </span>
      ) : null}

      <div className="mb-3 flex items-center justify-start">
        <span className="rounded-full bg-black/25 px-2 py-1 text-[11px] font-semibold text-white/85">
          ${skin.price.toFixed(2)}
        </span>
      </div>
      <div className="mb-3 flex min-h-[98px] items-center justify-center">
        <img
          src={skin.image}
          alt={`${skin.weapon} | ${skin.name}`}
          className="max-h-[96px] w-auto object-contain transition duration-200 group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>

      <div className="mt-auto">
        <p className="text-base font-semibold leading-tight text-white">
          {skin.weapon}
        </p>
        <p className="mt-1 text-sm font-medium text-white/85">{skin.name}</p>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">
          {skin.rarity}
        </p>
      </div>
    </button>
  );
}
