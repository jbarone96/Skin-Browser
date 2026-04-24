import { useMemo, useState } from "react";
import TradeupBuilder from "../components/TradeupBuilder";
import TradeupFilters from "../components/TradeupFilters";
import TradeupOutcomes from "../components/TradeupOutcomes";
import TradeupSkinGrid from "../components/TradeupSkinGrid";
import { useTradeupOutcomes } from "../hooks/useTradeupOutcomes";
import { useTradeupSkins } from "../hooks/useTradeupSkins";
import type {
  TradeupFiltersState,
  TradeupRarity,
  TradeupSkin,
} from "../types/tradeup";
import {
  calculateTradeupResult,
  getRequiredTradeupInputCount,
} from "../utils/tradeup";

const initialFilters: TradeupFiltersState = {
  search: "",
  collection: "All Collections",
  sortBy: "lowest-price",
  quality: "Consumer Grade",
};

export default function Tradeup() {
  const [filters, setFilters] = useState<TradeupFiltersState>(initialFilters);
  const [selectedSkins, setSelectedSkins] = useState<TradeupSkin[]>([]);

  const {
    outcomes,
    loading: outcomesLoading,
    error: outcomesError,
  } = useTradeupOutcomes(filters.quality);

  const {
    skins: filteredSkins,
    collections,
    loading: skinsLoading,
    error: skinsError,
  } = useTradeupSkins({ filters });

  const selectedInputRarity = selectedSkins[0]?.rarity ?? filters.quality;
  const requiredInputCount = getRequiredTradeupInputCount(selectedInputRarity);

  const calculation = useMemo(() => {
    return calculateTradeupResult(selectedSkins, outcomes);
  }, [selectedSkins, outcomes]);

  const handleFiltersChange = (nextFilters: TradeupFiltersState) => {
    const qualityChanged = nextFilters.quality !== filters.quality;

    setFilters(nextFilters);

    if (qualityChanged) {
      setSelectedSkins([]);
    }
  };

  const handleAddSkin = (skin: TradeupSkin) => {
    const currentRarity = selectedSkins[0]?.rarity ?? skin.rarity;
    const currentRequiredCount = getRequiredTradeupInputCount(currentRarity);

    if (selectedSkins.length >= currentRequiredCount) return;

    if (selectedSkins.length > 0 && skin.rarity !== selectedSkins[0].rarity) {
      return;
    }

    setSelectedSkins((prev) => [...prev, skin]);
  };

  const handleRemoveSkin = (indexToRemove: number) => {
    setSelectedSkins((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleClearSkins = () => {
    setSelectedSkins([]);
  };

  const isLoading = outcomesLoading || skinsLoading;
  const pageError = outcomesError || skinsError;

  const qualityOptions: TradeupRarity[] = [
    "Consumer Grade",
    "Industrial Grade",
    "Mil-Spec",
    "Restricted",
    "Classified",
    "Covert",
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(14,116,144,0.45),_transparent_28%),linear-gradient(180deg,#0d5f97_0%,#0a2788_30%,#07135d_65%,#051034_100%)] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute -left-[12%] top-[8%] h-[520px] w-[520px] rounded-full border border-white/20" />
        <div className="absolute left-[28%] top-[-8%] h-[840px] w-[840px] rounded-full border border-white/10" />
        <div className="absolute right-[-14%] top-[10%] h-[720px] w-[720px] rounded-full border border-white/10" />
      </div>

      <div className="relative mx-auto max-w-[2100px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
              Skin Browser
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Tradeup Builder
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/70 sm:text-base">
              Browse collections, pick inputs, and calculate tradeup outcomes.
            </p>
          </div>

          <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white/75">
            {collections.length} Total Collections
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <section className="rounded-[28px] border border-white/10 bg-black/20 p-4 sm:p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Select skins
              </h2>

              <div className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white/65">
                {isLoading ? "..." : `${filteredSkins.length} results`}
              </div>
            </div>

            <TradeupFilters
              filters={filters}
              collections={collections}
              qualityOptions={qualityOptions}
              onChange={handleFiltersChange}
            />

            <div className="mt-5 max-h-[calc(100vh-310px)] overflow-y-auto pr-1">
              {isLoading ? (
                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] px-6 py-12 text-center text-white/70">
                  Loading tradeup data from Firestore...
                </div>
              ) : pageError ? (
                <div className="rounded-[24px] border border-red-400/20 bg-red-500/10 px-6 py-12 text-center text-red-100">
                  {pageError}
                </div>
              ) : filteredSkins.length === 0 ? (
                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] px-6 py-12 text-center text-white/70">
                  No tradeup skins found for the current filters.
                </div>
              ) : (
                <TradeupSkinGrid
                  skins={filteredSkins}
                  selectedCount={selectedSkins.length}
                  onAddSkin={handleAddSkin}
                />
              )}
            </div>
          </section>

          <TradeupBuilder
            selectedSkins={selectedSkins}
            requiredInputCount={requiredInputCount}
            onRemoveSkin={handleRemoveSkin}
            onClearSkins={handleClearSkins}
          />

          <TradeupOutcomes calculation={calculation} />
        </div>
      </div>
    </main>
  );
}
