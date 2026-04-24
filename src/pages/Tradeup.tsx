import { useEffect, useMemo, useState } from "react";
import TradeupBuilder from "../components/TradeupBuilder";
import TradeupFilters from "../components/TradeupFilters";
import TradeupSkinGrid from "../components/TradeupSkinGrid";
import { useTradeupOutcomes } from "../hooks/useTradeupOutcomes";
import { useTradeupSkins } from "../hooks/useTradeupSkins";
import type {
  TradeupFiltersState,
  TradeupRarity,
  TradeupSkin,
} from "../types/tradeup";
import { calculateTradeupResult } from "../utils/tradeup";

const initialFilters: TradeupFiltersState = {
  search: "",
  collection: "All Collections",
  sortBy: "lowest-price",
  quality: "Restricted",
};

export default function Tradeup() {
  const [filters, setFilters] = useState<TradeupFiltersState>(initialFilters);
  const [selectedSkins, setSelectedSkins] = useState<TradeupSkin[]>([]);

  const {
    outcomes,
    availableInputQualities,
    loading: outcomesLoading,
    error: outcomesError,
  } = useTradeupOutcomes(filters.quality);

  const {
    skins: filteredSkins,
    collections,
    loading: skinsLoading,
    error: skinsError,
  } = useTradeupSkins({
    filters,
  });

  useEffect(() => {
    if (
      availableInputQualities.length > 0 &&
      !availableInputQualities.includes(filters.quality)
    ) {
      setFilters((prev) => ({
        ...prev,
        quality: availableInputQualities[0],
      }));
      setSelectedSkins([]);
    }
  }, [availableInputQualities, filters.quality]);

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
    if (selectedSkins.length >= 10) return;
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

  const qualityOptions: TradeupRarity[] =
    availableInputQualities.length > 0
      ? availableInputQualities
      : [filters.quality];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(14,116,144,0.45),_transparent_28%),linear-gradient(180deg,#0d5f97_0%,#0a2788_30%,#07135d_65%,#051034_100%)] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute -left-[12%] top-[8%] h-[520px] w-[520px] rounded-full border border-white/20" />
        <div className="absolute left-[28%] top-[-8%] h-[840px] w-[840px] rounded-full border border-white/10" />
        <div className="absolute right-[-14%] top-[10%] h-[720px] w-[720px] rounded-full border border-white/10" />
        <div className="absolute bottom-[-12%] left-[38%] h-[560px] w-[560px] rounded-full border border-white/10" />
      </div>

      <div className="relative mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
              Skin Browser
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Tradeup Builder
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/70 sm:text-base">
              Browse all collections and qualities freely.
            </p>
          </div>

          <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white/75">
            {collections.length} Total Collections
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[560px_minmax(0,1fr)] 2xl:grid-cols-[620px_minmax(0,1fr)]">
          <section className="rounded-[28px] border border-white/10 bg-black/20 p-4 sm:p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-white">
                  Select skins
                </h2>
                <p className="mt-1 text-sm font-medium text-white/55">
                  All collections unlocked.
                </p>
              </div>

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

            <div className="mt-5">
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
            calculation={calculation}
            onRemoveSkin={handleRemoveSkin}
            onClearSkins={handleClearSkins}
          />
        </div>
      </div>
    </main>
  );
}
