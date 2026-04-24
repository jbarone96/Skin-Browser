import type { TradeupSkin } from "../types/tradeup";

interface TradeupSkinCardProps {
  skin: TradeupSkin;
  isDisabled?: boolean;
  onAdd: (skin: TradeupSkin) => void;
}

export default function TradeupSkinCard({
  skin,
  isDisabled = false,
  onAdd,
}: TradeupSkinCardProps) {
  return (
    <button
      type="button"
      onClick={() => onAdd(skin)}
      disabled={isDisabled}
      className="group flex min-h-[176px] flex-col overflow-hidden rounded-[22px] border border-fuchsia-400/10 bg-[linear-gradient(180deg,rgba(88,12,138,0.92)_0%,rgba(59,7,100,0.96)_100%)] p-4 text-left transition hover:-translate-y-0.5 hover:border-fuchsia-300/20 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="rounded-full bg-black/20 px-2 py-1 text-[11px] font-semibold text-white/75">
          ${skin.price.toFixed(2)}
        </span>

        <span className="rounded-full bg-black/20 px-2 py-1 text-[11px] font-semibold text-white/75">
          {skin.wear === "Factory New"
            ? "FN"
            : skin.wear === "Minimal Wear"
              ? "MW"
              : skin.wear}
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
      </div>
    </button>
  );
}
