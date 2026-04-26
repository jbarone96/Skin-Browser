import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { FaChevronDown } from "react-icons/fa";
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

function formatFloatRange(minFloat: number | null, maxFloat: number | null) {
  if (minFloat === null || maxFloat === null) {
    return "N/A";
  }

  return `${minFloat.toFixed(2)} - ${maxFloat.toFixed(2)}`;
}

type FilterDropdownProps<T extends string> = {
  label: string;
  value: T;
  options: T[];
  onChange: (value: T) => void;
};

function FilterDropdown<T extends string>({
  label,
  value,
  options,
  onChange,
}: FilterDropdownProps<T>) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">
        {label}
      </label>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-gradient-to-b from-white/10 to-white/[0.03] px-4 py-3 text-sm font-medium text-white shadow-inner shadow-white/5 transition hover:border-white/20 hover:from-white/15 focus:outline-none focus:ring-2 focus:ring-cyan-400/20">
            <span className="truncate">{value}</span>
            <FaChevronDown className="ml-auto shrink-0 text-[10px] text-zinc-400" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            sideOffset={8}
            align="end"
            className="custom-scrollbar z-[999] max-h-80 w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto rounded-2xl border border-white/10 bg-[#080d18]/95 p-2 shadow-2xl shadow-black/50 outline-none backdrop-blur-2xl data-[state=open]:animate-[localeDropdownIn_160ms_ease-out] data-[state=closed]:animate-[localeDropdownOut_120ms_ease-in]"
          >
            {options.map((option) => (
              <DropdownMenu.Item
                key={option}
                onClick={() => onChange(option)}
                className={`flex cursor-pointer select-none items-center justify-between rounded-xl px-4 py-3 text-sm outline-none transition ${
                  value === option
                    ? "bg-cyan-400/10 text-cyan-300"
                    : "text-zinc-300 hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white"
                }`}
              >
                <span className="truncate">{option}</span>
                {value === option && <span className="text-cyan-300">✓</span>}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [weapon, setWeapon] = useState<SkinCategory | "All">("All");
  const [collectionFilter, setCollectionFilter] = useState<string>("All");

  const { skins, allSkins, loading, error } = useSkins({
    search,
    weapon,
    collection: collectionFilter,
  });

  const stats = useMemo(() => {
    return {
      total: skins.length,
    };
  }, [skins]);

  const collectionFilters = useMemo(() => {
    const collections = allSkins
      .map((skin) => skin.collection)
      .filter((collection): collection is string => Boolean(collection))
      .sort((a, b) => a.localeCompare(b));

    return ["All", ...Array.from(new Set(collections))];
  }, [allSkins]);

  return (
    <main className="min-h-screen px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-cyan-300/60">
              CS Skin Database
            </p>

            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Skin Vault
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60 sm:text-base">
              Your complete CS skin vault — explore, filter, and analyze every
              item in one place.
            </p>
          </div>

          <div className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white/75 backdrop-blur-xl">
            {stats.total} results
          </div>
        </div>

        <section className="mb-8 rounded-[28px] border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-5">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_220px_260px]">
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

            <FilterDropdown
              label="Weapon Type"
              value={weapon}
              options={weaponFilters}
              onChange={setWeapon}
            />

            <FilterDropdown
              label="Collection"
              value={collectionFilter}
              options={collectionFilters}
              onChange={setCollectionFilter}
            />
          </div>
        </section>

        {loading ? (
          <div className="flex min-h-[360px] items-center justify-center rounded-[28px] border border-white/10 bg-white/[0.045] px-6 py-16 backdrop-blur-xl">
            <div className="flex flex-col items-center gap-4">
              <div className="relative h-14 w-14">
                <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-r-cyan-300 border-t-cyan-300" />
                <div className="absolute inset-3 rounded-full bg-cyan-300/10 blur-md" />
              </div>

              <div className="text-center">
                <p className="text-sm font-semibold text-white/85">
                  Loading skins
                </p>
                <p className="mt-1 text-xs text-white/45">
                  Fetching latest item data...
                </p>
              </div>
            </div>
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
                      <span className="text-white/45">Float Range:</span>{" "}
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
