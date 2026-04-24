export type SkinCategory =
  | "Knives"
  | "Gloves"
  | "Pistols"
  | "Rifles"
  | "SMGs"
  | "Heavy"
  | "Other";

export interface SkinCollectionRef {
  id: string;
  name: string;
}

export interface SkinReference {
  id: string;
  name: string;
  skinName: string;
  fullName: string;
  weapon: string;
  weaponType: SkinCategory;
  category: SkinCategory;
  rarity: string | null;
  rarityColor: string | null;
  collection: string | null;
  collections: SkinCollectionRef[];
  marketHashName: string | null;
  image: string;
  statTrak: boolean;
  souvenir: boolean;
  minFloat: number | null;
  maxFloat: number | null;
  wears: string[];
  sourceType: "skin";
}

export interface CrateReference {
  id: string;
  name: string;
  crateType: "Weapon Cases" | "Souvenir Cases";
  marketHashName: string | null;
  image: string;
  containsRareSpecialItems: boolean;
  sourceType: "crate";
}

export interface CollectionReference {
  id: string;
  name: string;
  image: string;
  sourceType: "collection";
}

export interface StickerReference {
  id: string;
  name: string;
  marketHashName: string | null;
  rarity: string | null;
  rarityColor: string | null;
  image: string;
  tournament: string | null;
  team: string | null;
  player: string | null;
  sourceType: "sticker";
}

export interface OtherItemReference {
  id: string;
  name: string;
  type:
    | "collectible"
    | "agent"
    | "graffiti"
    | "music_kit"
    | "patch"
    | "key"
    | "keychain"
    | "tool";
  rarity: string | null;
  rarityColor: string | null;
  marketHashName: string | null;
  image: string;
  sourceType:
    | "collectible"
    | "agent"
    | "graffiti"
    | "music_kit"
    | "patch"
    | "key"
    | "keychain"
    | "tool";
}
