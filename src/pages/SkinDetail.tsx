import { Link, useParams } from "react-router-dom";
import { useSkin } from "../hooks/useSkin";

function formatFloatRange(minFloat: number | null, maxFloat: number | null) {
  if (minFloat === null || maxFloat === null) {
    return "N/A";
  }

  return `${minFloat.toFixed(12)} - ${maxFloat.toFixed(12)}`;
}

export default function SkinDetail() {
  const { id } = useParams<{ id: string }>();
  const { skin, loading, error } = useSkin(id);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,116,144,0.45),_transparent_28%),linear-gradient(180deg,#0d5f97_0%,#0a2788_30%,#07135d_65%,#051034_100%)] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/"
          className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/15 hover:text-white"
        >
          ← Back to Skins
        </Link>

        {loading ? (
          <div className="rounded-[28px] border border-white/10 bg-black/20 px-6 py-16 text-center text-white/75">
            Loading skin...
          </div>
        ) : error || !skin ? (
          <div className="rounded-[28px] border border-red-400/20 bg-red-500/10 px-6 py-16 text-center text-red-100">
            {error ?? "Skin not found."}
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-6 rounded-[32px] border border-white/10 bg-black/20 p-6 lg:grid-cols-[minmax(0,480px)_minmax(0,1fr)] lg:p-8">
            <div className="flex min-h-[320px] items-center justify-center rounded-[28px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-8">
              <img
                src={skin.image}
                alt={skin.fullName}
                className="max-h-[360px] w-auto object-contain"
              />
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
                  {skin.weaponType}
                </p>
                <div className="mt-2 flex items-start gap-3">
                  <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    {skin.fullName}
                  </h1>

                  {skin.rarityColor ? (
                    <span
                      className="mt-3 h-4 w-4 shrink-0 rounded-full border border-white/20"
                      style={{ backgroundColor: skin.rarityColor }}
                      aria-label={skin.rarity ?? "Rarity color"}
                    />
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">
                    Weapon
                  </p>
                  <p className="mt-2 text-base font-semibold text-white">
                    {skin.weapon}
                  </p>
                </div>

                <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">
                    Rarity
                  </p>
                  <p className="mt-2 text-base font-semibold text-white">
                    {skin.rarity ?? "N/A"}
                  </p>
                </div>

                <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">
                    Collection
                  </p>
                  <p className="mt-2 text-base font-semibold text-white">
                    {skin.collection ?? "N/A"}
                  </p>
                </div>

                <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">
                    Float Range
                  </p>
                  <p className="mt-2 text-base font-semibold text-white">
                    {formatFloatRange(skin.minFloat, skin.maxFloat)}
                  </p>
                </div>

                <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">
                    StatTrak
                  </p>
                  <p className="mt-2 text-base font-semibold text-white">
                    {skin.statTrak ? "Yes" : "No"}
                  </p>
                </div>

                <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">
                    Souvenir
                  </p>
                  <p className="mt-2 text-base font-semibold text-white">
                    {skin.souvenir ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">
                  Available Wears
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {skin.wears.length > 0 ? (
                    skin.wears.map((wear) => (
                      <span
                        key={wear}
                        className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white/85"
                      >
                        {wear}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm font-medium text-white/65">
                      N/A
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
