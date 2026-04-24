export type TradeupRarity =
  | "Consumer Grade"
  | "Industrial Grade"
  | "Mil-Spec"
  | "Restricted"
  | "Classified"
  | "Covert";

export type TradeupWear =
  | "Factory New"
  | "Minimal Wear"
  | "Field-Tested"
  | "Well-Worn"
  | "Battle-Scarred";

export interface TradeupSkin {
  id: string;
  name: string;
  weapon: string;
  collection: string;
  rarity: TradeupRarity;
  wear: TradeupWear;
  float: number;
  minFloat: number;
  maxFloat: number;
  price: number;
  image: string;
}

export interface TradeupOutcomeSkin {
  id: string;
  name: string;
  weapon: string;
  collection: string;
  rarity: TradeupRarity;
  minFloat: number;
  maxFloat: number;
  image: string;
  prices: Partial<Record<TradeupWear, number>>;
}

export interface TradeupFiltersState {
  search: string;
  collection: string;
  sortBy: "lowest-price" | "highest-price" | "lowest-float";
  quality: TradeupRarity;
}

export interface TradeupCalculatedOutcome {
  id: string;
  skin: TradeupOutcomeSkin;
  probability: number;
  outputFloat: number;
  outputWear: TradeupWear;
  marketPrice: number;
  profit: number;
  isProfitable: boolean;
}

export interface TradeupSummary {
  averageFloat: number;
  totalCost: number;
  profitChance: number;
  profitabilityPercent: number;
  expectedValue: number;
  averageProfit: number;
  minLoss: number;
  maxLoss: number;
}

export interface TradeupCalculationResult {
  isValid: boolean;
  message: string;
  outcomes: TradeupCalculatedOutcome[];
  summary: TradeupSummary;
}
