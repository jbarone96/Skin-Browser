import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import type {
  TradeupOutcomeRarity,
  TradeupOutcomeSkin,
  TradeupRarity,
  TradeupWear,
} from "../types/tradeup";
import { db } from "../utils/firebase";

interface UseTradeupOutcomesResult {
  outcomes: TradeupOutcomeSkin[];
  collections: string[];
  availableInputQualities: TradeupRarity[];
  loading: boolean;
  error: string | null;
}

const NEXT_RARITY: Record<TradeupRarity, TradeupOutcomeRarity> = {
  "Consumer Grade": "Industrial Grade",
  "Industrial Grade": "Mil-Spec",
  "Mil-Spec": "Restricted",
  Restricted: "Classified",
  Classified: "Covert",
  Covert: "Special",
};

const INPUT_QUALITY_ORDER: TradeupRarity[] = [
  "Consumer Grade",
  "Industrial Grade",
  "Mil-Spec",
  "Restricted",
  "Classified",
  "Covert",
];

const DEFAULT_PRICES: Partial<Record<TradeupWear, number>> = {
  "Factory New": 300,
  "Minimal Wear": 225,
  "Field-Tested": 150,
  "Well-Worn": 110,
  "Battle-Scarred": 90,
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

function isSpecialItem(data: Record<string, unknown>) {
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

function getSourceCollections(data: Record<string, unknown>) {
  const collections = new Set<string>();

  if (typeof data.collection === "string" && data.collection.trim()) {
    collections.add(data.collection);
  }

  if (Array.isArray(data.collections)) {
    for (const item of data.collections) {
      if (typeof item === "string") {
        collections.add(item);
      }

      if (typeof item === "object" && item !== null) {
        const collectionItem = item as Record<string, unknown>;

        if (collectionItem.name) collections.add(String(collectionItem.name));
        if (collectionItem.fullName) {
          collections.add(String(collectionItem.fullName));
        }
        if (collectionItem.collection) {
          collections.add(String(collectionItem.collection));
        }
      }
    }
  }

  return [...collections];
}

function getPrices(data: Record<string, unknown>) {
  if (typeof data.prices === "object" && data.prices !== null) {
    return data.prices as Partial<Record<TradeupWear, number>>;
  }

  return DEFAULT_PRICES;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Unknown Firestore error.";
}

export function useTradeupOutcomes(
  selectedInputQuality: TradeupRarity,
): UseTradeupOutcomesResult {
  const [allOutcomes, setAllOutcomes] = useState<TradeupOutcomeSkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchOutcomes() {
      try {
        setLoading(true);
        setError(null);

        const snapshot = await getDocs(collection(db, "skins"));

        const nextOutcomes = snapshot.docs.flatMap((doc) => {
          const data = doc.data();
          const specialItem = isSpecialItem(data);
          const normalizedRarity = normalizeRarity(data.rarity);

          if (!specialItem && !normalizedRarity) {
            return [];
          }

          const rarity: TradeupOutcomeRarity = specialItem
            ? "Special"
            : normalizedRarity!;

          const sourceCollections = getSourceCollections(data);
          const collection = getCollection(data);

          return [
            {
              id: doc.id,
              name: String(data.skinName ?? data.name ?? ""),
              weapon: String(data.weapon ?? ""),
              collection,
              sourceCollections:
                sourceCollections.length > 0 ? sourceCollections : [collection],
              rarity,
              minFloat: Number(data.minFloat ?? 0),
              maxFloat: Number(data.maxFloat ?? 1),
              image: String(data.image ?? ""),
              prices: getPrices(data),
            },
          ];
        });

        if (isMounted) {
          setAllOutcomes(nextOutcomes);
        }
      } catch (err) {
        console.error("[useTradeupOutcomes] Firestore read failed:", err);

        if (isMounted) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchOutcomes();

    return () => {
      isMounted = false;
    };
  }, []);

  const outcomes = useMemo(() => {
    const targetRarity = NEXT_RARITY[selectedInputQuality];

    return allOutcomes.filter((outcome) => outcome.rarity === targetRarity);
  }, [allOutcomes, selectedInputQuality]);

  const collections = useMemo(() => {
    return [...new Set(allOutcomes.map((outcome) => outcome.collection))].sort(
      (a, b) => a.localeCompare(b),
    );
  }, [allOutcomes]);

  return {
    outcomes,
    collections,
    availableInputQualities: INPUT_QUALITY_ORDER,
    loading,
    error,
  };
}
