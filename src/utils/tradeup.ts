import type {
  TradeupCalculatedOutcome,
  TradeupCalculationResult,
  TradeupOutcomeSkin,
  TradeupRarity,
  TradeupSkin,
  TradeupSummary,
  TradeupWear,
} from "../types/tradeup";

const NEXT_RARITY: Record<TradeupRarity, TradeupRarity | null> = {
  "Consumer Grade": "Industrial Grade",
  "Industrial Grade": "Mil-Spec",
  "Mil-Spec": "Restricted",
  Restricted: "Classified",
  Classified: "Covert",
  Covert: null,
};

const EMPTY_SUMMARY: TradeupSummary = {
  averageFloat: 0,
  totalCost: 0,
  profitChance: 0,
  profitabilityPercent: 0,
  expectedValue: 0,
  averageProfit: 0,
  minLoss: 0,
  maxLoss: 0,
};

export function formatFloat12(value: number): string {
  return value.toFixed(12);
}

export function getWearShort(wear: TradeupWear): string {
  if (wear === "Factory New") return "FN";
  if (wear === "Minimal Wear") return "MW";
  if (wear === "Field-Tested") return "FT";
  if (wear === "Well-Worn") return "WW";
  return "BS";
}

export function getWearFromFloat(floatValue: number): TradeupWear {
  if (floatValue <= 0.07) return "Factory New";
  if (floatValue <= 0.15) return "Minimal Wear";
  if (floatValue <= 0.38) return "Field-Tested";
  if (floatValue <= 0.45) return "Well-Worn";
  return "Battle-Scarred";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getFallbackPrice(outcome: TradeupOutcomeSkin): number {
  return (
    outcome.prices["Factory New"] ??
    outcome.prices["Minimal Wear"] ??
    outcome.prices["Field-Tested"] ??
    outcome.prices["Well-Worn"] ??
    outcome.prices["Battle-Scarred"] ??
    0
  );
}

function getOutcomePrice(
  outcome: TradeupOutcomeSkin,
  wear: TradeupWear,
): number {
  return outcome.prices[wear] ?? getFallbackPrice(outcome);
}

function getAverageInputFloat(inputs: TradeupSkin[]): number {
  if (inputs.length === 0) return 0;
  return inputs.reduce((sum, skin) => sum + skin.float, 0) / inputs.length;
}

function getAverageNormalizedFloat(inputs: TradeupSkin[]): number {
  if (inputs.length === 0) return 0;

  const total = inputs.reduce((sum, skin) => {
    const range = skin.maxFloat - skin.minFloat;

    if (range <= 0) {
      return sum;
    }

    const normalized = (skin.float - skin.minFloat) / range;
    return sum + clamp(normalized, 0, 1);
  }, 0);

  return total / inputs.length;
}

function getOutcomeFloat(
  averageNormalizedFloat: number,
  outcome: TradeupOutcomeSkin,
): number {
  const range = outcome.maxFloat - outcome.minFloat;

  if (range <= 0) {
    return outcome.minFloat;
  }

  return clamp(
    outcome.minFloat + averageNormalizedFloat * range,
    outcome.minFloat,
    outcome.maxFloat,
  );
}

function getNegativeLossBounds(outcomes: TradeupCalculatedOutcome[]) {
  const negativeProfits = outcomes
    .map((outcome) => outcome.profit)
    .filter((profit) => profit < 0);

  if (negativeProfits.length === 0) {
    return {
      minLoss: 0,
      maxLoss: 0,
    };
  }

  return {
    minLoss: Math.max(...negativeProfits),
    maxLoss: Math.min(...negativeProfits),
  };
}

export function calculateTradeupResult(
  inputs: TradeupSkin[],
  allPossibleOutcomes: TradeupOutcomeSkin[],
): TradeupCalculationResult {
  if (inputs.length === 0) {
    return {
      isValid: false,
      message: "Add skins to see tradeup outcomes.",
      outcomes: [],
      summary: EMPTY_SUMMARY,
    };
  }

  if (inputs.length !== 10) {
    return {
      isValid: false,
      message: "Select exactly 10 skins to calculate outcomes.",
      outcomes: [],
      summary: {
        ...EMPTY_SUMMARY,
        averageFloat: getAverageInputFloat(inputs),
        totalCost: inputs.reduce((sum, skin) => sum + skin.price, 0),
      },
    };
  }

  const baseRarity = inputs[0].rarity;
  const hasMixedRarities = inputs.some((skin) => skin.rarity !== baseRarity);

  if (hasMixedRarities) {
    return {
      isValid: false,
      message: "All input skins must be the same rarity.",
      outcomes: [],
      summary: {
        ...EMPTY_SUMMARY,
        averageFloat: getAverageInputFloat(inputs),
        totalCost: inputs.reduce((sum, skin) => sum + skin.price, 0),
      },
    };
  }

  const nextRarity = NEXT_RARITY[baseRarity];

  if (!nextRarity) {
    return {
      isValid: false,
      message: "These skins cannot be traded up any further.",
      outcomes: [],
      summary: {
        ...EMPTY_SUMMARY,
        averageFloat: getAverageInputFloat(inputs),
        totalCost: inputs.reduce((sum, skin) => sum + skin.price, 0),
      },
    };
  }

  const collectionCounts = inputs.reduce<Record<string, number>>(
    (acc, skin) => {
      acc[skin.collection] = (acc[skin.collection] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const eligibleOutcomes = allPossibleOutcomes.filter(
    (outcome) =>
      outcome.rarity === nextRarity &&
      Object.prototype.hasOwnProperty.call(
        collectionCounts,
        outcome.collection,
      ),
  );

  if (eligibleOutcomes.length === 0) {
    return {
      isValid: false,
      message: "No valid outcomes found for the selected collections.",
      outcomes: [],
      summary: {
        ...EMPTY_SUMMARY,
        averageFloat: getAverageInputFloat(inputs),
        totalCost: inputs.reduce((sum, skin) => sum + skin.price, 0),
      },
    };
  }

  const outcomesPerCollection = eligibleOutcomes.reduce<Record<string, number>>(
    (acc, outcome) => {
      acc[outcome.collection] = (acc[outcome.collection] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const totalCost = inputs.reduce((sum, skin) => sum + skin.price, 0);
  const averageFloat = getAverageInputFloat(inputs);
  const averageNormalizedFloat = getAverageNormalizedFloat(inputs);

  const outcomes = eligibleOutcomes
    .map<TradeupCalculatedOutcome>((outcome) => {
      const collectionWeight =
        (collectionCounts[outcome.collection] ?? 0) / inputs.length;
      const probability =
        collectionWeight / (outcomesPerCollection[outcome.collection] ?? 1);

      const outputFloat = getOutcomeFloat(averageNormalizedFloat, outcome);
      const outputWear = getWearFromFloat(outputFloat);
      const marketPrice = getOutcomePrice(outcome, outputWear);
      const profit = marketPrice - totalCost;

      return {
        id: outcome.id,
        skin: outcome,
        probability,
        outputFloat,
        outputWear,
        marketPrice,
        profit,
        isProfitable: profit > 0,
      };
    })
    .sort((a, b) => b.profit - a.profit);

  const expectedValue = outcomes.reduce(
    (sum, outcome) => sum + outcome.marketPrice * outcome.probability,
    0,
  );

  const profitChance =
    outcomes.reduce((sum, outcome) => {
      return outcome.isProfitable ? sum + outcome.probability : sum;
    }, 0) * 100;

  const profitabilityPercent =
    totalCost > 0 ? (expectedValue / totalCost) * 100 : 0;

  const averageProfit = expectedValue - totalCost;

  const { minLoss, maxLoss } = getNegativeLossBounds(outcomes);

  return {
    isValid: true,
    message: "",
    outcomes,
    summary: {
      averageFloat,
      totalCost,
      profitChance,
      profitabilityPercent,
      expectedValue,
      averageProfit,
      minLoss,
      maxLoss,
    },
  };
}
