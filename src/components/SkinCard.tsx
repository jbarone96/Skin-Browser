import { Link } from "react-router-dom";
import type { Skin } from "../types/skin";
import { formatPrice } from "../utils/formatPrice";

type SkinCardProps = {
  skin: Skin;
};

export default function SkinCard({ skin }: SkinCardProps) {
  return (
    <Link to={`/skin/${skin.id}`} className="block">
      <article className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
        <div className="aspect-[4/3] w-full bg-zinc-800">
          <img
            src={skin.image}
            alt={`${skin.weapon} | ${skin.name}`}
            className="h-full w-full object-contain p-4"
            loading="lazy"
          />
        </div>

        <div className="space-y-3 p-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              {skin.weapon}
            </p>
            <h3 className="mt-1 text-lg font-semibold text-white">
              {skin.name}
            </h3>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="rounded-md bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-300">
              {skin.wear}
            </span>

            <span className="text-base font-semibold text-emerald-400">
              {formatPrice(skin.price)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
