import { Link, useParams } from "react-router-dom";
import { useSkin } from "../hooks/useSkin";

function formatFloatRange(minFloat: number | null, maxFloat: number | null) {
  if (minFloat === null || maxFloat === null) return "N/A";
  return `${minFloat.toFixed(12)} - ${maxFloat.toFixed(12)}`;
}

export default function SkinDetail() {
  const { id } = useParams<{ id: string }>();
  const { skin, loading, error } = useSkin(id);

  const wears = (
    (skin?.wears ?? []) as Array<string | { id?: string; name: string }>
  ).map((wear) => (typeof wear === "string" ? wear : wear.name));

  return (
    <main className="min-h-screen px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/"
          className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white/80 backdrop-blur-xl transition hover:bg-white/10 hover:text-white"
        >
          ← Back to Skins
        </Link>

        {loading ? (
          <div className="rounded-[28px] border border-white/10 bg-white/[0.045] px-6 py-16 text-center text-white/75 backdrop-blur-xl">
            Loading skin...
          </div>
        ) : error || !skin ? (
          <div className="rounded-[28px] border border-red-400/20 bg-red-500/10 px-6 py-16 text-center text-red-100 backdrop-blur-xl">
            {error ?? "Skin not found."}
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-6 rounded-[32px] border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl lg:grid-cols-[minmax(0,480px)_minmax(0,1fr)] lg:p-8">
            <div className="flex min-h-[320px] items-center justify-center rounded-[28px] border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-8">
              <img
                src={skin.image}
                alt={skin.fullName}
                className="max-h-[360px] w-auto object-contain"
              />
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/70">
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
                <DetailCard label="Weapon" value={skin.weapon} />
                <DetailCard label="Rarity" value={skin.rarity ?? "N/A"} />
                <DetailCard
                  label="Collection"
                  value={skin.collection ?? "N/A"}
                />
                <DetailCard
                  label="Float Range"
                  value={formatFloatRange(skin.minFloat, skin.maxFloat)}
                />
                <DetailCard
                  label="StatTrak"
                  value={skin.statTrak ? "Yes" : "No"}
                />
                <DetailCard
                  label="Souvenir"
                  value={skin.souvenir ? "Yes" : "No"}
                />
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">
                  Available Wears
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {wears.length > 0 ? (
                    wears.map((wear) => (
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

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold text-white">{value}</p>
    </div>
  );
}
