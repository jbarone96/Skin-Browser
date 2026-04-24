export type GameItemCategory =
  | "Knives"
  | "Gloves"
  | "Pistols"
  | "Rifles"
  | "SMGs"
  | "Heavy"
  | "Weapon Cases"
  | "Souvenir Cases"
  | "Collections"
  | "Stickers"
  | "Other"
  | "Colors";

export interface GameItem {
  id: string;
  name: string;
  category: GameItemCategory;
  itemCount: number;
  image?: string;
  colorHex?: string;
  sourceId?: string;
}
