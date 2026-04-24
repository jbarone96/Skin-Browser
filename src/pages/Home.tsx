import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSkins } from "../hooks/useSkins";
import type { SkinCategory } from "../types/skin";

const weaponFilters: Array<SkinCategory | "All"> = [
  "All",
  "Knives",
  "Gloves",
  "Pistols",
  "Rifles",
  "SMGs",
  "Heavy",
];

const wearFilters = [
  "All",
  "Factory New",
  "Minimal Wear",
  "Field-Tested",
  "Well-Worn",
  "Battle-Scarred",
];

function formatFloatRange(minFloat: number | null, maxFloat: number | null) {
  if (minFloat === null || maxFloat === null) {
    return "N/A";
  }

  return `${minFloat.toFixed(2)} - ${maxFloat.toFixed(2)}`;
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [weapon, setWeapon] = useState<SkinCategory | "All">("All");
  const [wear, setWear] = useState<(typeof wearFilters)[number]>("All");

  const { skins, loading, error } = useSkins({
    search,
    weapon,
    wear,
  });

  const stats = useMemo(() => {
    return {
      total: skins.length,
    };
  }, [skins]);

  return (
    <main className="min-h-screen px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/70">
              Skin Browser
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Skin Reference
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65 sm:text-base">
              Live from Firestore now. Browse your imported CS item reference
              data with search and simple filtering.
            </p>
          </div>

          <div className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white/75 backdrop-blur-xl">
            {stats.total} results
          </div>
        </div>

        <section className="mb-8 rounded-[28px] border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-5">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">
                Search
              </label>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search skin, weapon, or collection..."
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium text-white placeholder:text-white/40 transition focus:border-cyan-400/40 focus:bg-black/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">
                Weapon Type
              </label>
              <select
                value={weapon}
                onChange={(event) =>
                  setWeapon(event.target.value as SkinCategory | "All")
                }
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium text-white focus:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/10"
              >
                {weaponFilters.map((filter) => (
                  <option key={filter} value={filter}>
                    {filter}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">
                Wear
              </label>
              <select
                value={wear}
                onChange={(event) =>
                  setWear(event.target.value as (typeof wearFilters)[number])
                }
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium text-white focus:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/10"
              >
                {wearFilters.map((filter) => (
                  <option key={filter} value={filter}>
                    {filter}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="rounded-[28px] border border-white/10 bg-white/[0.045] px-6 py-16 text-center text-white/75 backdrop-blur-xl">
            Loading skins from Firestore...
          </div>
        ) : error ? (
          <div className="rounded-[28px] border border-red-400/20 bg-red-500/10 px-6 py-16 text-center text-red-100 backdrop-blur-xl">
            {error}
          </div>
        ) : skins.length === 0 ? (
          <div className="rounded-[28px] border border-white/10 bg-white/[0.045] px-6 py-16 text-center text-white/75 backdrop-blur-xl">
            No skins found.
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
            {skins.map((skin) => (
              <Link
                key={skin.id}
                to={`/skin/${skin.id}`}
                className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] shadow-lg shadow-black/20 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-cyan-400/20 hover:bg-white/[0.07]"
              >
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
                      <h2 className="mt-1 text-base font-semibold leading-tight text-white">
                        {skin.fullName}
                      </h2>
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
              </Link>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
