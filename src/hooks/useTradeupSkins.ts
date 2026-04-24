import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../utils/firebase";
import type {
  TradeupFiltersState,
  TradeupRarity,
  TradeupSkin,
  TradeupWear,
} from "../types/tradeup";

interface UseTradeupSkinsOptions {
  filters: TradeupFiltersState;
  allowedCollections?: string[];
}

interface UseTradeupSkinsResult {
  skins: TradeupSkin[];
  collections: string[];
  loading: boolean;
  error: string | null;
}

const RARITY_COLORS: Record<TradeupRarity, string> = {
  "Consumer Grade": "#b0c3d9",
  "Industrial Grade": "#5e98d9",
  "Mil-Spec": "#4b69ff",
  Restricted: "#8847ff",
  Classified: "#d32ce6",
  Covert: "#eb4b4b",
};

const WEAR_FLOATS: Record<TradeupWear, number> = {
  "Factory New": 0.03,
  "Minimal Wear": 0.1,
  "Field-Tested": 0.25,
  "Well-Worn": 0.4,
  "Battle-Scarred": 0.55,
};

function normalizeRarity(value: unknown): TradeupRarity | null {
  const rarity = String(value ?? "")
    .trim()
    .replace(" Grade", "")
    .toLowerCase();

  if (rarity === "consumer") return "Consumer Grade";
  if (rarity === "industrial") return "Industrial Grade";
  if (rarity === "mil-spec" || rarity === "milspec") return "Mil-Spec";
  if (rarity === "restricted") return "Restricted";
  if (rarity === "classified") return "Classified";
  if (rarity === "covert") return "Covert";

  return null;
}

function isTradeupWear(value: unknown): value is TradeupWear {
  return (
    value === "Factory New" ||
    value === "Minimal Wear" ||
    value === "Field-Tested" ||
    value === "Well-Worn" ||
    value === "Battle-Scarred"
  );
}

function shouldExcludeFromTradeupInputs(data: Record<string, unknown>) {
  const text = [
    data.category,
    data.weaponType,
    data.weapon,
    data.name,
    data.skinName,
    data.fullName,
    data.sourceType,
  ]
    .map((value) => String(value ?? "").toLowerCase())
    .join(" ");

  return (
    text.includes("knife") ||
    text.includes("knives") ||
    text.includes("glove") ||
    text.includes("gloves") ||
    text.includes("★")
  );
}

function getCollection(data: Record<string, unknown>) {
  if (typeof data.collection === "string" && data.collection.trim()) {
    return data.collection;
  }

  if (Array.isArray(data.collections) && data.collections[0]?.name) {
    return String(data.collections[0].name);
  }

  return "Unknown Collection";
}

function getMockPrice(rarity: TradeupRarity, wear: TradeupWear) {
  const rarityBase: Record<TradeupRarity, number> = {
    "Consumer Grade": 0.15,
    "Industrial Grade": 0.45,
    "Mil-Spec": 1.25,
    Restricted: 3,
    Classified: 8,
    Covert: 18,
  };

  const wearMultiplier: Record<TradeupWear, number> = {
    "Factory New": 1.8,
    "Minimal Wear": 1.35,
    "Field-Tested": 1,
    "Well-Worn": 0.78,
    "Battle-Scarred": 0.62,
  };

  return rarityBase[rarity] * wearMultiplier[wear];
}

function getWearFloat(wear: TradeupWear, minFloat: number, maxFloat: number) {
  const preferredFloat = WEAR_FLOATS[wear];

  if (preferredFloat < minFloat) return minFloat;
  if (preferredFloat > maxFloat) return maxFloat;

  return preferredFloat;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Unknown Firestore error.";
}

export function useTradeupSkins({
  filters,
  allowedCollections,
}: UseTradeupSkinsOptions): UseTradeupSkinsResult {
  const [allSkins, setAllSkins] = useState<TradeupSkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchSkins() {
      try {
        setLoading(true);
        setError(null);

        const snapshot = await getDocs(collection(db, "skins"));

        const nextSkins = snapshot.docs.flatMap((doc) => {
          const data = doc.data();

          if (shouldExcludeFromTradeupInputs(data)) {
            return [];
          }

          const rarity = normalizeRarity(data.rarity);

          if (!rarity) {
            return [];
          }

          const minFloat = Number(data.minFloat ?? 0);
          const maxFloat = Number(data.maxFloat ?? 1);

          const wears: TradeupWear[] = Array.isArray(data.wears)
            ? data.wears
                .map((wear: { name?: unknown }) => wear.name)
                .filter(isTradeupWear)
            : ["Field-Tested"];

          return wears.map((wear) => {
            const price = Number(data.price ?? data.prices?.[wear] ?? 0);

            return {
              id: `${doc.id}-${wear}`,
              name: String(data.skinName ?? data.name ?? ""),
              weapon: String(data.weapon ?? ""),
              collection: getCollection(data),
              rarity,
              rarityColor: String(data.rarityColor ?? RARITY_COLORS[rarity]),
              wear,
              float: getWearFloat(wear, minFloat, maxFloat),
              minFloat,
              maxFloat,
              price: price > 0 ? price : getMockPrice(rarity, wear),
              image: String(data.image ?? ""),
            };
          });
        });

        if (isMounted) {
          setAllSkins(nextSkins);
        }
      } catch (err) {
        console.error("[useTradeupSkins] Firestore read failed:", err);

        if (isMounted) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchSkins();

    return () => {
      isMounted = false;
    };
  }, []);

  const collections = useMemo(() => {
    return [...new Set(allSkins.map((skin) => skin.collection))].sort((a, b) =>
      a.localeCompare(b),
    );
  }, [allSkins]);

  const skins = useMemo(() => {
    let nextSkins = [...allSkins];

    if (allowedCollections?.length) {
      const allowedSet = new Set(allowedCollections);
      nextSkins = nextSkins.filter((skin) => allowedSet.has(skin.collection));
    }

    if (filters.search.trim()) {
      const query = filters.search.trim().toLowerCase();

      nextSkins = nextSkins.filter((skin) => {
        const fullName = `${skin.weapon} | ${skin.name}`.toLowerCase();

        return (
          fullName.includes(query) ||
          skin.weapon.toLowerCase().includes(query) ||
          skin.name.toLowerCase().includes(query)
        );
      });
    }

    if (filters.collection !== "All Collections") {
      nextSkins = nextSkins.filter(
        (skin) => skin.collection === filters.collection,
      );
    }

    nextSkins = nextSkins.filter((skin) => skin.rarity === filters.quality);

    switch (filters.sortBy) {
      case "highest-price":
        nextSkins.sort((a, b) => b.price - a.price);
        break;
      case "lowest-float":
        nextSkins.sort((a, b) => a.float - b.float);
        break;
      case "lowest-price":
      default:
        nextSkins.sort((a, b) => a.price - b.price);
        break;
    }

    return nextSkins;
  }, [allSkins, allowedCollections, filters]);

  return {
    skins,
    collections,
    loading,
    error,
  };
}
