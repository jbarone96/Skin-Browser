import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../utils/firebase";
import type { TradeupFiltersState, TradeupSkin } from "../types/tradeup";

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

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error
  ) {
    const firebaseError = error as { code?: string; message?: string };
    return `${firebaseError.code ?? "unknown"}: ${
      firebaseError.message ?? "Unknown Firestore error."
    }`;
  }

  if (error instanceof Error) {
    return error.message;
  }

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

        const snapshot = await getDocs(collection(db, "tradeup_skins"));

        const nextSkins = snapshot.docs.map((doc) => {
          const data = doc.data() as Omit<TradeupSkin, "id">;

          return {
            id: doc.id,
            ...data,
          };
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
