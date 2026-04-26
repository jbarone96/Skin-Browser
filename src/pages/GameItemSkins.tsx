import { Link, useParams } from "react-router-dom";
import { useMemo } from "react";
import { useSkins } from "../hooks/useSkins";

function decodeParam(value?: string) {
  return decodeURIComponent(value ?? "");
}

function getDopplerPhase(skin: {
  id: string;
  fullName?: string;
  name?: string;
  skinName?: string;
  marketHashName?: string | null;
  image?: string;
}) {
  const text = [
    skin.id,
    skin.fullName,
    skin.name,
    skin.skinName,
    skin.marketHashName,
    skin.image,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (!text.includes("doppler")) return null;

  if (text.includes("phase-1") || text.includes("phase 1")) return "Phase 1";
  if (text.includes("phase-2") || text.includes("phase 2")) return "Phase 2";
  if (text.includes("phase-3") || text.includes("phase 3")) return "Phase 3";
  if (text.includes("phase-4") || text.includes("phase 4")) return "Phase 4";

  if (text.includes("sapphire")) return "Sapphire";
  if (text.includes("ruby")) return "Ruby";
  if (text.includes("emerald")) return "Emerald";
  if (text.includes("black-pearl") || text.includes("black pearl")) {
    return "Black Pearl";
  }

  return "Doppler";
}

function getDopplerPhaseClass(phase: string) {
  switch (phase) {
    case "Phase 1":
      return "border-indigo-400/30 bg-indigo-500/15 text-indigo-200";
    case "Phase 2":
      return "border-violet-400/30 bg-violet-500/15 text-violet-200";
    case "Phase 3":
      return "border-fuchsia-400/30 bg-fuchsia-500/15 text-fuchsia-200";
    case "Phase 4":
      return "border-red-400/30 bg-red-500/15 text-red-200";
    case "Sapphire":
      return "border-blue-400/30 bg-blue-500/15 text-blue-200";
    case "Ruby":
      return "border-rose-400/30 bg-rose-500/15 text-rose-200";
    case "Emerald":
      return "border-emerald-400/30 bg-emerald-500/15 text-emerald-200";
    case "Black Pearl":
      return "border-zinc-400/30 bg-zinc-500/15 text-zinc-200";
    default:
      return "border-cyan-400/30 bg-cyan-500/15 text-cyan-200";
  }
}

export default function GameItemSkins() {
  const { category, value } = useParams<{ category: string; value: string }>();
  const { allSkins, loading, error } = useSkins();

  const decodedCategory = decodeParam(category);
  const decodedValue = decodeParam(value);

  const skins = useMemo(() => {
    return allSkins.filter((skin) => {
      if (decodedCategory === "Collections") {
        return (
          skin.collection === decodedValue ||
          skin.collections?.some(
            (collection) => collection.name === decodedValue,
          )
        );
      }

      if (
        decodedCategory === "Knives" ||
        decodedCategory === "Gloves" ||
        decodedCategory === "Pistols" ||
        decodedCategory === "Rifles" ||
        decodedCategory === "SMGs" ||
        decodedCategory === "Heavy"
      ) {
        return skin.weapon === decodedValue;
      }

      if (decodedCategory === "Colors") {
        return skin.rarityColor?.toUpperCase() === decodedValue.toUpperCase();
      }

      return false;
    });
  }, [allSkins, decodedCategory, decodedValue]);

  return (
    <main className="min-h-screen px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[2100px]">
        <Link
          to="/items"
          className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-zinc-950/70 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
        >
          ← Back to Game Items
        </Link>

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/70">
            {decodedCategory}
          </p>

          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {decodedValue} Skins
          </h1>

          <p className="mt-3 text-lg text-zinc-500">
            {skins.length} {skins.length === 1 ? "skin" : "skins"} found
          </p>
        </div>

        {loading ? (
          <div className="rounded-[28px] border border-white/10 bg-zinc-950/70 px-6 py-16 text-center text-zinc-300">
            Loading skins...
          </div>
        ) : error ? (
          <div className="rounded-[28px] border border-red-400/20 bg-red-500/10 px-6 py-16 text-center text-red-100">
            {error}
          </div>
        ) : skins.length === 0 ? (
          <div className="rounded-[28px] border border-white/10 bg-zinc-950/70 px-6 py-16 text-center text-zinc-300">
            No skins found.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
            {skins.map((skin) => {
              const phase = getDopplerPhase(skin);
              return (
                <Link
                  key={skin.id}
                  to={`/skin/${skin.id}`}
                  className="group relative flex min-h-[280px] flex-col overflow-hidden rounded-[30px] border border-white/10 bg-zinc-950/80 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-zinc-900/90"
                >
                  {phase ? (
                    <span
                      className={`absolute left-5 top-5 z-10 rounded-md border px-2.5 py-1 text-xs font-bold shadow-lg backdrop-blur ${getDopplerPhaseClass(
                        phase,
                      )}`}
                    >
                      {phase}
                    </span>
                  ) : null}

                  <div className="flex min-h-[145px] items-center justify-center rounded-[24px] bg-white/[0.035] p-4">
                    <img
                      src={skin.image}
                      alt={skin.fullName}
                      className="max-h-[130px] w-auto object-contain transition duration-200 group-hover:scale-[1.04]"
                      loading="lazy"
                    />
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300/70">
                      {skin.weapon}
                    </p>

                    <h2 className="mt-2 line-clamp-2 text-base font-semibold leading-tight text-white">
                      {skin.fullName}
                    </h2>

                    <p className="mt-2 text-sm text-zinc-500">
                      {skin.rarity ?? "N/A"}
                    </p>
                  </div>

                  <div className="mt-auto pt-4">
                    <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-300">
                      View Details
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
