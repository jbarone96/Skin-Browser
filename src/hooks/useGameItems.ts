import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../utils/firebase";
import type { GameItem, GameItemCategory } from "../types/game-item";
import type {
  CollectionReference,
  CrateReference,
  OtherItemReference,
  SkinReference,
  StickerReference,
} from "../types/skin";

export const gameItemCategories: GameItemCategory[] = [
  "Knives",
  "Gloves",
  "Pistols",
  "Rifles",
  "SMGs",
  "Heavy",
  "Weapon Cases",
  "Souvenir Cases",
  "Collections",
  "Stickers",
  "Other",
  "Colors",
];

interface UseGameItemsResult {
  groupedItems: Record<GameItemCategory, GameItem[]>;
  loading: boolean;
  error: string | null;
}

function normalizeString(value: string) {
  return value.trim().toLowerCase();
}

function buildSkinWeaponCards(
  skins: SkinReference[],
  category: Extract<
    GameItemCategory,
    "Knives" | "Gloves" | "Pistols" | "Rifles" | "SMGs" | "Heavy"
  >,
): GameItem[] {
  const filtered = skins.filter((skin) => skin.weaponType === category);
  const map = new Map<string, GameItem>();

  for (const skin of filtered) {
    const existing = map.get(skin.weapon);

    if (existing) {
      existing.itemCount += 1;
      continue;
    }

    map.set(skin.weapon, {
      id: `${category}-${skin.weapon}`,
      name: `${skin.weapon} Skins`,
      category,
      itemCount: 1,
      image: skin.image,
    });
  }

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function buildCrateCards(
  crates: CrateReference[],
  category: "Weapon Cases" | "Souvenir Cases",
): GameItem[] {
  return crates
    .filter((crate) => crate.crateType === category)
    .map((crate) => ({
      id: crate.id,
      name: crate.name,
      category,
      itemCount: 1,
      image: crate.image,
      sourceId: crate.id,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function buildCollectionCards(collections: CollectionReference[]): GameItem[] {
  return collections
    .map((item) => ({
      id: item.id,
      name: item.name,
      category: "Collections" as const,
      itemCount: 1,
      image: item.image,
      sourceId: item.id,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function buildStickerCards(stickers: StickerReference[]): GameItem[] {
  return stickers
    .map((item) => ({
      id: item.id,
      name: item.name,
      category: "Stickers" as const,
      itemCount: 1,
      image: item.image,
      sourceId: item.id,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function buildOtherCards(items: OtherItemReference[]): GameItem[] {
  return items
    .map((item) => ({
      id: item.id,
      name: item.name,
      category: "Other" as const,
      itemCount: 1,
      image: item.image,
      sourceId: item.id,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function buildColorCards(
  skins: SkinReference[],
  stickers: StickerReference[],
  otherItems: OtherItemReference[],
): GameItem[] {
  const items = [
    ...skins.map((item) => item.rarityColor),
    ...stickers.map((item) => item.rarityColor),
    ...otherItems.map((item) => item.rarityColor),
  ].filter(Boolean) as string[];

  const colorCounts = new Map<string, number>();

  for (const color of items) {
    colorCounts.set(color, (colorCounts.get(color) ?? 0) + 1);
  }

  return Array.from(colorCounts.entries())
    .map(([colorHex, count]) => ({
      id: `color-${colorHex}`,
      name: colorHex.toUpperCase(),
      category: "Colors" as const,
      itemCount: count,
      colorHex,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function useGameItems(search = ""): UseGameItemsResult {
  const [skins, setSkins] = useState<SkinReference[]>([]);
  const [crates, setCrates] = useState<CrateReference[]>([]);
  const [collectionsData, setCollectionsData] = useState<CollectionReference[]>(
    [],
  );
  const [stickers, setStickers] = useState<StickerReference[]>([]);
  const [otherItems, setOtherItems] = useState<OtherItemReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchAllGameItems() {
      try {
        setLoading(true);
        setError(null);

        const [
          skinsSnapshot,
          cratesSnapshot,
          collectionsSnapshot,
          stickersSnapshot,
          otherItemsSnapshot,
        ] = await Promise.all([
          getDocs(collection(db, "skins")),
          getDocs(collection(db, "crates")),
          getDocs(collection(db, "collections")),
          getDocs(collection(db, "stickers")),
          getDocs(collection(db, "other_items")),
        ]);

        if (!isMounted) return;

        setSkins(
          skinsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<SkinReference, "id">),
          })),
        );

        setCrates(
          cratesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<CrateReference, "id">),
          })),
        );

        setCollectionsData(
          collectionsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<CollectionReference, "id">),
          })),
        );

        setStickers(
          stickersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<StickerReference, "id">),
          })),
        );

        setOtherItems(
          otherItemsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<OtherItemReference, "id">),
          })),
        );
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError("Failed to load game items from Firestore.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchAllGameItems();

    return () => {
      isMounted = false;
    };
  }, []);

  const groupedItems = useMemo<Record<GameItemCategory, GameItem[]>>(() => {
    const rawGroups: Record<GameItemCategory, GameItem[]> = {
      Knives: buildSkinWeaponCards(skins, "Knives"),
      Gloves: buildSkinWeaponCards(skins, "Gloves"),
      Pistols: buildSkinWeaponCards(skins, "Pistols"),
      Rifles: buildSkinWeaponCards(skins, "Rifles"),
      SMGs: buildSkinWeaponCards(skins, "SMGs"),
      Heavy: buildSkinWeaponCards(skins, "Heavy"),
      "Weapon Cases": buildCrateCards(crates, "Weapon Cases"),
      "Souvenir Cases": buildCrateCards(crates, "Souvenir Cases"),
      Collections: buildCollectionCards(collectionsData),
      Stickers: buildStickerCards(stickers),
      Other: buildOtherCards(otherItems),
      Colors: buildColorCards(skins, stickers, otherItems),
    };

    const normalizedSearch = normalizeString(search);

    if (!normalizedSearch) {
      return rawGroups;
    }

    const filtered = {} as Record<GameItemCategory, GameItem[]>;

    for (const category of gameItemCategories) {
      filtered[category] = rawGroups[category].filter((item) =>
        normalizeString(item.name).includes(normalizedSearch),
      );
    }

    return filtered;
  }, [skins, crates, collectionsData, stickers, otherItems, search]);

  return {
    groupedItems,
    loading,
    error,
  };
}
