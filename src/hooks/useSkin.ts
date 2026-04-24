import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import type { SkinReference } from "../types/skin";

interface UseSkinResult {
  skin: SkinReference | null;
  loading: boolean;
  error: string | null;
}

export function useSkin(id: string | undefined): UseSkinResult {
  const [skin, setSkin] = useState<SkinReference | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchSkin() {
      if (!id) {
        setLoading(false);
        setError("Missing skin id.");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const snapshot = await getDoc(doc(db, "skins", id));

        if (!snapshot.exists()) {
          if (isMounted) {
            setSkin(null);
            setError("Skin not found.");
          }
          return;
        }

        const data = snapshot.data() as Omit<SkinReference, "id">;

        if (isMounted) {
          setSkin({
            id: snapshot.id,
            ...data,
          });
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError("Failed to load skin.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchSkin();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return {
    skin,
    loading,
    error,
  };
}
