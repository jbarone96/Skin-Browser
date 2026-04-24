import { Link } from "react-router-dom";
import type { SkinReference } from "../types/skin";

type SkinCardProps = {
  skin: SkinReference;
};

function formatFloatRange(minFloat: number | null, maxFloat: number | null) {
  if (minFloat === null || maxFloat === null) return "N/A";
  return `${minFloat.toFixed(2)} - ${maxFloat.toFixed(2)}`;
}

export default function SkinCard({ skin }: SkinCardProps) {
  return (
    <Link to={`/skin/${skin.id}`} className="group block">
      <article className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] shadow-lg shadow-black/20 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-cyan-400/20 hover:bg-white/[0.07]">
        <div className="flex aspect-[4/3] items-center justify-center border-b border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-6">
          <img
            src={skin.image}
            alt={skin.fullName}
            className="max-h-full max-w-full object-contain transition duration-200 group-hover:scale-[1.03]"
            loading="lazy"
          />
        </div>

        <div className="space-y-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                {skin.weaponType}
              </p>

              <h3 className="mt-1 text-base font-semibold leading-tight text-white">
                {skin.fullName}
              </h3>
            </div>

            {skin.rarityColor ? (
              <span
                className="mt-1 h-3 w-3 shrink-0 rounded-full border border-white/20"
                style={{ backgroundColor: skin.rarityColor }}
                aria-label={skin.rarity ?? "Rarity color"}
              />
            ) : null}
          </div>

          <div className="space-y-1 text-sm text-white/70">
            <p>
              <span className="text-white/45">Collection:</span>{" "}
              {skin.collection ?? "N/A"}
            </p>

            <p>
              <span className="text-white/45">Rarity:</span>{" "}
              {skin.rarity ?? "N/A"}
            </p>

            <p>
              <span className="text-white/45">Float:</span>{" "}
              {formatFloatRange(skin.minFloat, skin.maxFloat)}
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
}
