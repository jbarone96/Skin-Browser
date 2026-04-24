import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../utils/firebase";
import type { SkinReference, SkinCategory } from "../types/skin";

interface UseSkinsOptions {
  search?: string;
  weapon?: SkinCategory | "All";
  wear?: string | "All";
}

interface UseSkinsResult {
  skins: SkinReference[];
  allSkins: SkinReference[];
  loading: boolean;
  error: string | null;
}

function normalizeString(value: string) {
  return value.trim().toLowerCase();
}

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error
  ) {
    const firebaseError = error as { code?: string; message?: string };
    return `${firebaseError.code ?? "unknown"}: ${firebaseError.message ?? "Unknown Firestore error."}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown Firestore error.";
}

export function useSkins(options?: UseSkinsOptions): UseSkinsResult {
  const [allSkins, setAllSkins] = useState<SkinReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const search = options?.search ?? "";
  const weapon = options?.weapon ?? "All";
  const wear = options?.wear ?? "All";

  useEffect(() => {
    let isMounted = true;

    async function fetchSkins() {
      try {
        setLoading(true);
        setError(null);

        console.log("[useSkins] Fetching skins from Firestore...");
        console.log(
          "[useSkins] Project ID:",
          import.meta.env.VITE_FIREBASE_PROJECT_ID,
        );

        const snapshot = await getDocs(collection(db, "skins"));

        const nextSkins = snapshot.docs.map((doc) => {
          const data = doc.data() as Omit<SkinReference, "id">;

          return {
            id: doc.id,
            ...data,
          };
        });

        nextSkins.sort((a, b) => a.fullName.localeCompare(b.fullName));

        console.log("[useSkins] Loaded skins:", nextSkins.length);

        if (isMounted) {
          setAllSkins(nextSkins);
        }
      } catch (err) {
        console.error("[useSkins] Firestore read failed:", err);

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

  const skins = useMemo(() => {
    const normalizedSearch = normalizeString(search);

    return allSkins.filter((skin) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        normalizeString(skin.fullName).includes(normalizedSearch) ||
        normalizeString(skin.weapon).includes(normalizedSearch) ||
        normalizeString(skin.skinName).includes(normalizedSearch) ||
        normalizeString(skin.collection ?? "").includes(normalizedSearch);

      const matchesWeapon = weapon === "All" || skin.weaponType === weapon;
      const matchesWear =
        wear === "All" ||
        (Array.isArray(skin.wears) && skin.wears.includes(wear));

      return matchesSearch && matchesWeapon && matchesWear;
    });
  }, [allSkins, search, weapon, wear]);

  return {
    skins,
    allSkins,
    loading,
    error,
  };
}
