import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import type { TradeupOutcomeSkin, TradeupRarity } from "../types/tradeup";
import { db } from "../utils/firebase";

interface UseTradeupOutcomesResult {
  outcomes: TradeupOutcomeSkin[];
  collections: string[];
  availableInputQualities: TradeupRarity[];
  loading: boolean;
  error: string | null;
}

const PREV_RARITY: Partial<Record<TradeupRarity, TradeupRarity>> = {
  "Industrial Grade": "Consumer Grade",
  "Mil-Spec": "Industrial Grade",
  Restricted: "Mil-Spec",
  Classified: "Restricted",
  Covert: "Classified",
};

const INPUT_QUALITY_ORDER: TradeupRarity[] = [
  "Consumer Grade",
  "Industrial Grade",
  "Mil-Spec",
  "Restricted",
  "Classified",
];

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

        const snapshot = await getDocs(collection(db, "tradeup_outcomes"));

        const nextOutcomes = snapshot.docs.map((doc) => {
          const data = doc.data() as Omit<TradeupOutcomeSkin, "id">;

          return {
            id: doc.id,
            ...data,
          };
        });

        nextOutcomes.sort((a, b) =>
          `${a.collection} ${a.weapon} ${a.name}`.localeCompare(
            `${b.collection} ${b.weapon} ${b.name}`,
          ),
        );

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

  const availableInputQualities = useMemo(() => {
    const qualities = new Set<TradeupRarity>();

    for (const outcome of allOutcomes) {
      const inputQuality = PREV_RARITY[outcome.rarity];

      if (inputQuality) {
        qualities.add(inputQuality);
      }
    }

    return INPUT_QUALITY_ORDER.filter((quality) => qualities.has(quality));
  }, [allOutcomes]);

  const outcomes = useMemo(() => {
    const matchingOutcomeRarity =
      (Object.entries(PREV_RARITY).find(
        ([, inputRarity]) => inputRarity === selectedInputQuality,
      )?.[0] as TradeupRarity | undefined) ?? null;

    if (!matchingOutcomeRarity) {
      return [];
    }

    return allOutcomes.filter(
      (outcome) => outcome.rarity === matchingOutcomeRarity,
    );
  }, [allOutcomes, selectedInputQuality]);

  const collections = useMemo(() => {
    return [...new Set(allOutcomes.map((outcome) => outcome.collection))].sort(
      (a, b) => a.localeCompare(b),
    );
  }, [allOutcomes]);

  return {
    outcomes,
    collections,
    availableInputQualities,
    loading,
    error,
  };
}
