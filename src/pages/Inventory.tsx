import { useEffect, useMemo, useState } from "react";
import {
  FaBoxOpen,
  FaExternalLinkAlt,
  FaFilter,
  FaLock,
  FaSearch,
  FaSteam,
  FaSyncAlt,
} from "react-icons/fa";
import PageHeader from "../components/PageHeader";
import { useSkins } from "../hooks/useSkins";
import { useSteamAuth } from "../hooks/useSteamAuth";
import type { SkinReference } from "../types/skin";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001";

type InventoryItem = {
  assetId: string;
  classId: string;
  instanceId: string;
  amount: number;
  name: string;
  marketName: string;
  type: string;
  rarity: string;
  weapon: string;
  collection: string;
  exterior: string;
  tradable: boolean;
  marketable: boolean;
  inspectLink?: string;
  imageUrl: string;
  marketUrl: string;
  price?: number;
};

type EnrichedInventoryItem = InventoryItem & {
  databaseImageUrl?: string;
  databaseRarity?: string | null;
  databaseCollection?: string | null;
  databaseWeapon?: string;
  databaseWeaponType?: string;
  matchedSkinId?: string;
};

type InventoryResponse = {
  steamId: string;
  total: number;
  rows?: number;
  items: InventoryItem[];
};

type SortOption =
  | "name-asc"
  | "name-desc"
  | "price-desc"
  | "price-asc"
  | "float-asc"
  | "float-desc"
  | "rarity"
  | "exterior"
  | "tradable"
  | "marketable";

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Name A-Z", value: "name-asc" },
  { label: "Name Z-A", value: "name-desc" },
  { label: "Price High-Low", value: "price-desc" },
  { label: "Price Low-High", value: "price-asc" },
  { label: "Float Low-High", value: "float-asc" },
  { label: "Float High-Low", value: "float-desc" },
  { label: "Rarity", value: "rarity" },
  { label: "Quality / Exterior", value: "exterior" },
  { label: "Tradable First", value: "tradable" },
  { label: "Marketable First", value: "marketable" },
];

const EXTERIOR_RANK: Record<string, number> = {
  "Factory New": 1,
  "Minimal Wear": 2,
  "Field-Tested": 3,
  "Well-Worn": 4,
  "Battle-Scarred": 5,
};

const RARITY_RANK: Record<string, number> = {
  Contraband: 1,
  Covert: 2,
  Classified: 3,
  Restricted: 4,
  "Mil-Spec Grade": 5,
  Industrial: 6,
  "Consumer Grade": 7,
  Base: 8,
};

function normalizeString(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/™/g, "")
    .replace(/★/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripWearSuffix(value: string) {
  return value.replace(
    /\s+\((Factory New|Minimal Wear|Field-Tested|Well-Worn|Battle-Scarred|Not Painted)\)$/i,
    "",
  );
}

function stripSpecialPrefixes(value: string) {
  return value
    .replace(/^StatTrak™\s+/i, "")
    .replace(/^Souvenir\s+/i, "")
    .replace(/^★\s+/i, "")
    .trim();
}

function getInventoryMatchKeys(item: InventoryItem) {
  const names = [
    item.name,
    item.marketName,
    stripWearSuffix(item.name),
    stripWearSuffix(item.marketName),
    stripSpecialPrefixes(item.name),
    stripSpecialPrefixes(item.marketName),
    stripSpecialPrefixes(stripWearSuffix(item.name)),
    stripSpecialPrefixes(stripWearSuffix(item.marketName)),
  ];

  return Array.from(
    new Set(names.filter(Boolean).map((name) => normalizeString(name))),
  );
}

function getSkinMatchKeys(skin: SkinReference) {
  const names = [
    skin.marketHashName ?? "",
    skin.fullName,
    skin.name,
    `${skin.weapon} | ${skin.skinName}`,
    stripWearSuffix(skin.marketHashName ?? ""),
    stripWearSuffix(skin.fullName),
    stripSpecialPrefixes(skin.marketHashName ?? ""),
    stripSpecialPrefixes(skin.fullName),
    stripSpecialPrefixes(stripWearSuffix(skin.marketHashName ?? "")),
    stripSpecialPrefixes(stripWearSuffix(skin.fullName)),
  ];

  return Array.from(
    new Set(names.filter(Boolean).map((name) => normalizeString(name))),
  );
}

function buildSkinLookup(skins: SkinReference[]) {
  const lookup = new Map<string, SkinReference>();

  skins.forEach((skin) => {
    getSkinMatchKeys(skin).forEach((key) => {
      if (key && !lookup.has(key)) {
        lookup.set(key, skin);
      }
    });
  });

  return lookup;
}

function findMatchingSkin(
  item: InventoryItem,
  skinLookup: Map<string, SkinReference>,
) {
  const itemKeys = getInventoryMatchKeys(item);

  for (const key of itemKeys) {
    const match = skinLookup.get(key);

    if (match) {
      return match;
    }
  }

  return null;
}

function enrichInventoryItems(
  items: InventoryItem[],
  skins: SkinReference[],
): EnrichedInventoryItem[] {
  if (skins.length === 0) {
    return items;
  }

  const skinLookup = buildSkinLookup(skins);

  return items.map((item) => {
    const matchedSkin = findMatchingSkin(item, skinLookup);

    if (!matchedSkin) {
      return item;
    }

    return {
      ...item,
      imageUrl: matchedSkin.image || item.imageUrl,
      rarity: matchedSkin.rarity || item.rarity,
      weapon: matchedSkin.weapon || item.weapon,
      collection: matchedSkin.collection || item.collection,
      databaseImageUrl: matchedSkin.image,
      databaseRarity: matchedSkin.rarity,
      databaseCollection: matchedSkin.collection,
      databaseWeapon: matchedSkin.weapon,
      databaseWeaponType: matchedSkin.weaponType,
      matchedSkinId: matchedSkin.id,
    };
  });
}

function getPrice(item: InventoryItem) {
  return typeof item.price === "number" ? item.price : 0;
}

function getRarityRank(rarity: string) {
  return RARITY_RANK[rarity] ?? 999;
}

function getExteriorRank(exterior: string) {
  return EXTERIOR_RANK[exterior] ?? 999;
}

function getItemFloat(item: InventoryItem, floatMap: Record<string, number>) {
  return typeof floatMap[item.assetId] === "number"
    ? floatMap[item.assetId]
    : null;
}

function sortInventoryItems(
  items: EnrichedInventoryItem[],
  sort: SortOption,
  floatMap: Record<string, number>,
) {
  return [...items].sort((a, b) => {
    switch (sort) {
      case "name-asc":
        return a.name.localeCompare(b.name);

      case "name-desc":
        return b.name.localeCompare(a.name);

      case "price-desc":
        return getPrice(b) - getPrice(a);

      case "price-asc":
        return getPrice(a) - getPrice(b);

      case "float-asc": {
        const aFloat = getItemFloat(a, floatMap);
        const bFloat = getItemFloat(b, floatMap);

        if (aFloat === null && bFloat === null) {
          return a.name.localeCompare(b.name);
        }

        if (aFloat === null) return 1;
        if (bFloat === null) return -1;

        return aFloat - bFloat;
      }

      case "float-desc": {
        const aFloat = getItemFloat(a, floatMap);
        const bFloat = getItemFloat(b, floatMap);

        if (aFloat === null && bFloat === null) {
          return a.name.localeCompare(b.name);
        }

        if (aFloat === null) return 1;
        if (bFloat === null) return -1;

        return bFloat - aFloat;
      }

      case "rarity":
        return (
          getRarityRank(a.rarity) - getRarityRank(b.rarity) ||
          a.name.localeCompare(b.name)
        );

      case "exterior":
        return (
          getExteriorRank(a.exterior) - getExteriorRank(b.exterior) ||
          a.name.localeCompare(b.name)
        );

      case "tradable":
        return (
          Number(b.tradable) - Number(a.tradable) ||
          a.name.localeCompare(b.name)
        );

      case "marketable":
        return (
          Number(b.marketable) - Number(a.marketable) ||
          a.name.localeCompare(b.name)
        );

      default:
        return 0;
    }
  });
}

function getDisplayName(item: InventoryItem) {
  return item.name.replace(
    /\s+\((Factory New|Minimal Wear|Field-Tested|Well-Worn|Battle-Scarred|Not Painted)\)$/i,
    "",
  );
}

function getFloatLabel(item: InventoryItem, floatMap: Record<string, number>) {
  const itemFloat = getItemFloat(item, floatMap);

  if (itemFloat !== null) {
    return itemFloat.toFixed(5);
  }

  if (!item.inspectLink) {
    return "N/A";
  }

  return "Unavailable";
}

export default function Inventory() {
  const { user, isAuthenticated, isLoading, signIn } = useSteamAuth();
  const { allSkins, loading: skinsLoading } = useSkins({
    search: "",
    weapon: "All",
    wear: "All",
    collection: "All",
  });

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState(0);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState("");
  const [floatMap, setFloatMap] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("name-asc");

  const enrichedItems = useMemo(() => {
    return enrichInventoryItems(items, allSkins);
  }, [items, allSkins]);

  const inspectableItems = useMemo(() => {
    return enrichedItems.filter((item) => item.inspectLink);
  }, [enrichedItems]);

  const matchedItemsCount = useMemo(() => {
    return enrichedItems.filter((item) => item.matchedSkinId).length;
  }, [enrichedItems]);

  const filteredItems = useMemo(() => {
    const query = normalizeString(search);

    const searchedItems = query
      ? enrichedItems.filter((item) => {
          return [
            item.name,
            item.marketName,
            item.type,
            item.rarity,
            item.weapon,
            item.collection,
            item.exterior,
            item.databaseWeapon,
            item.databaseWeaponType,
            item.databaseCollection,
            item.databaseRarity,
          ]
            .filter(Boolean)
            .some((value) => normalizeString(String(value)).includes(query));
        })
      : enrichedItems;

    return sortInventoryItems(searchedItems, sort, floatMap);
  }, [enrichedItems, search, sort, floatMap]);

  async function loadInventory() {
    try {
      setInventoryLoading(true);
      setInventoryError("");
      setFloatMap({});

      const response = await fetch(`${API_BASE_URL}/steam/inventory`, {
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.message ||
            "Unable to load Steam inventory. Make sure your inventory is public.",
        );
      }

      const data = (await response.json()) as InventoryResponse;

      setItems(Array.isArray(data.items) ? data.items : []);
      setTotal(data.total);
      setRows(data.rows ?? data.items.length);
    } catch (error) {
      console.error(error);
      setItems([]);
      setTotal(0);
      setRows(0);
      setFloatMap({});
      setInventoryError(
        error instanceof Error
          ? error.message
          : "Unable to load Steam inventory.",
      );
    } finally {
      setInventoryLoading(false);
    }
  }

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      void loadInventory();
    }
  }, [isLoading, isAuthenticated, user]);

  return (
    <main className="min-h-[calc(100vh-5rem)] overflow-hidden bg-[#05070d] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[28rem] w-[42rem] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-0 top-40 h-[24rem] w-[24rem] rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <PageHeader
          eyebrow="Steam Inventory"
          title="Inventory"
          description="Connect Steam, sync your CS2 items, and manage your skins from one clean browser."
        />

        {isLoading ? (
          <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur-2xl">
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-center">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                <FaSyncAlt className="animate-spin text-xl" />
              </div>
              <p className="text-lg font-semibold text-white">
                Checking Steam session
              </p>
              <p className="mt-2 text-sm text-zinc-400">
                Verifying your login with Skin Browser.
              </p>
            </div>
          </section>
        ) : isAuthenticated && user ? (
          <div className="mt-8 space-y-6">
            <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur-2xl sm:p-8">
              <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />

              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-5">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="h-20 w-20 rounded-3xl border border-white/10 object-cover shadow-xl shadow-black/30"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-300/20 bg-cyan-500/10 text-2xl font-black text-cyan-300 shadow-xl shadow-cyan-950/20">
                      {user.displayName.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                      Steam connected
                    </div>

                    <h2 className="truncate text-2xl font-bold text-white sm:text-3xl">
                      {user.displayName}
                    </h2>

                    <p className="mt-1 max-w-xl truncate text-sm text-zinc-400">
                      Steam ID: {user.steamId}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => void loadInventory()}
                    disabled={inventoryLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FaSyncAlt
                      className={inventoryLoading ? "animate-spin" : ""}
                    />
                    Refresh Inventory
                  </button>

                  <a
                    href={user.profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/30 hover:bg-white/10"
                  >
                    <FaSteam />
                    View Steam Profile
                  </a>
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                  <FaBoxOpen />
                </div>
                <p className="text-sm text-zinc-400">Inventory Items</p>
                <p className="mt-1 text-xl font-bold text-white">
                  {inventoryLoading ? "Loading..." : total.toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-zinc-500">
                  Showing {rows.toLocaleString()} loaded rows from Steam.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-300">
                  <FaFilter />
                </div>
                <p className="text-sm text-zinc-400">Matched Data</p>
                <p className="mt-1 truncate text-xl font-bold text-white">
                  {skinsLoading
                    ? "Loading..."
                    : `${matchedItemsCount}/${enrichedItems.length}`}
                </p>
                <p className="mt-2 text-sm text-zinc-500">
                  Inventory items matched to your database.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">
                  <FaLock />
                </div>
                <p className="text-sm text-zinc-400">Floats</p>
                <p className="mt-1 truncate text-xl font-bold text-white">
                  0/{inspectableItems.length}
                </p>
                <p className="mt-2 text-sm text-zinc-500">
                  Float lookups are paused due to provider rate limits.
                </p>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl sm:p-6">
              <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Your Items</h3>
                  <p className="mt-1 text-sm text-zinc-400">
                    Showing {filteredItems.length.toLocaleString()} inventory
                    rows. Database images are used first when matched.
                  </p>
                </div>

                <div className="flex w-full flex-col gap-3 sm:flex-row xl:max-w-2xl">
                  <div className="relative flex-1">
                    <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search inventory..."
                      className="w-full rounded-2xl border border-white/10 bg-black/30 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-300/40 focus:bg-black/40"
                    />
                  </div>

                  <select
                    value={sort}
                    onChange={(event) =>
                      setSort(event.target.value as SortOption)
                    }
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-medium text-white outline-none transition focus:border-cyan-300/40 focus:bg-black/40 sm:w-56"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        className="bg-zinc-950 text-white"
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {inventoryLoading ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-center">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                    <FaSyncAlt className="animate-spin text-xl" />
                  </div>
                  <p className="text-lg font-semibold text-white">
                    Loading inventory
                  </p>
                  <p className="mt-2 text-sm text-zinc-400">
                    Pulling your public CS2 items from Steam.
                  </p>
                </div>
              ) : inventoryError ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-red-400/20 bg-red-500/5 p-8 text-center">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-red-500/10 text-red-300">
                    <FaLock className="text-2xl" />
                  </div>

                  <p className="text-xl font-bold text-white">
                    Inventory unavailable
                  </p>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
                    {inventoryError}
                  </p>
                </div>
              ) : filteredItems.length > 0 ? (
                <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {filteredItems.map((item) => (
                    <article
                      key={item.assetId}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/25 transition hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-white/[0.06]"
                    >
                      <div className="relative flex aspect-square items-center justify-center bg-gradient-to-b from-white/[0.06] to-black/20 p-5">
                        {item.amount > 1 && (
                          <span className="absolute right-3 top-3 rounded-full border border-cyan-300/20 bg-cyan-400/15 px-2.5 py-1 text-xs font-bold text-cyan-100">
                            x{item.amount}
                          </span>
                        )}

                        {item.matchedSkinId && (
                          <span className="absolute left-3 top-3 rounded-full border border-emerald-300/20 bg-emerald-400/15 px-2.5 py-1 text-[11px] font-bold text-emerald-100">
                            DB
                          </span>
                        )}

                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            loading="lazy"
                            className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center rounded-2xl border border-dashed border-white/10 text-zinc-600">
                            <FaBoxOpen className="text-3xl" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col p-4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-5 text-white">
                              {getDisplayName(item)}
                            </h4>

                            <p className="mt-1 truncate text-xs text-zinc-500">
                              {item.databaseWeaponType || item.type}
                            </p>
                          </div>

                          <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                            <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                              Float
                            </p>
                            <p className="mt-0.5 text-sm font-semibold text-cyan-200">
                              {getFloatLabel(item, floatMap)}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {item.rarity && (
                              <span className="rounded-full border border-cyan-300/15 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-200">
                                {item.rarity}
                              </span>
                            )}

                            {item.exterior && (
                              <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-semibold text-zinc-300">
                                {item.exterior}
                              </span>
                            )}

                            {item.tradable && (
                              <span className="rounded-full border border-emerald-300/15 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
                                Tradable
                              </span>
                            )}
                          </div>
                        </div>

                        {item.marketUrl && (
                          <a
                            href={item.marketUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-auto inline-flex items-center gap-2 pt-4 text-xs font-semibold text-cyan-300 transition hover:text-cyan-200"
                          >
                            View on Market
                            <FaExternalLinkAlt className="text-[10px]" />
                          </a>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-300">
                    <FaBoxOpen className="text-2xl" />
                  </div>

                  <p className="text-xl font-bold text-white">
                    {enrichedItems.length > 0
                      ? "No items matched your search"
                      : "No inventory items found"}
                  </p>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
                    {enrichedItems.length > 0
                      ? "Clear or adjust your inventory search to see more items."
                      : "Your inventory loaded, but Steam did not return any CS2 items for this view."}
                  </p>
                </div>
              )}
            </section>
          </div>
        ) : (
          <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur-2xl">
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-300">
                <FaSteam className="text-3xl" />
              </div>

              <p className="text-2xl font-bold text-white">
                Connect Steam to unlock your browser
              </p>

              <p className="mt-3 max-w-md text-sm leading-6 text-zinc-400">
                Sign in with Steam so Skin Browser can identify your account and
                prepare your CS2 inventory.
              </p>

              <button
                onClick={signIn}
                className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-[#171a21] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-black/30 transition hover:bg-[#1f2530]"
              >
                <FaSteam className="text-lg" />
                Sign in with Steam
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
