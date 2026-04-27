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

type TradeupStep = 1 | 2 | 3;

export default function Tradeup() {
  const [filters, setFilters] = useState<TradeupFiltersState>(initialFilters);
  const [selectedSkins, setSelectedSkins] = useState<TradeupSkin[]>([]);
  const [step, setStep] = useState<TradeupStep>(1);

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
  const isContractReady = selectedSkins.length === requiredInputCount;

  const calculation = useMemo(() => {
    return calculateTradeupResult(selectedSkins, outcomes);
  }, [selectedSkins, outcomes]);

  const handleFiltersChange = (nextFilters: TradeupFiltersState) => {
    const qualityChanged = nextFilters.quality !== filters.quality;

    setFilters(nextFilters);

    if (qualityChanged) {
      setSelectedSkins([]);
      setStep(1);
    }
  };

  const displaySkins = useMemo(() => {
    const map = new Map<string, TradeupSkin>();

    for (const skin of filteredSkins) {
      const key = `${skin.collection}-${skin.weapon}-${skin.name}-${skin.rarity}`;

      const existing = map.get(key);

      if (!existing || skin.price < existing.price) {
        map.set(key, skin);
      }
    }

    return Array.from(map.values());
  }, [filteredSkins]);

  const handleAddSkin = (skin: TradeupSkin) => {
    const currentRarity = selectedSkins[0]?.rarity ?? skin.rarity;
    const currentRequiredCount = getRequiredTradeupInputCount(currentRarity);

    if (selectedSkins.length >= currentRequiredCount) return;

    if (selectedSkins.length > 0 && skin.rarity !== selectedSkins[0].rarity) {
      return;
    }

    setSelectedSkins((prev) => [...prev, skin]);
  };

  const handleDuplicateSkin = (skin: TradeupSkin) => {
    const currentRarity = selectedSkins[0]?.rarity ?? skin.rarity;
    const currentRequiredCount = getRequiredTradeupInputCount(currentRarity);

    if (selectedSkins.length >= currentRequiredCount) return;

    if (selectedSkins.length > 0 && skin.rarity !== selectedSkins[0].rarity) {
      return;
    }

    setSelectedSkins((prev) => [...prev, skin]);
  };

  const handleUpdateSkinFloat = (indexToUpdate: number, nextFloat: number) => {
    setSelectedSkins((prev) =>
      prev.map((skin, index) =>
        index === indexToUpdate ? { ...skin, float: nextFloat } : skin,
      ),
    );
  };

  const handleRemoveSkin = (indexToRemove: number) => {
    setSelectedSkins((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleClearSkins = () => {
    setSelectedSkins([]);
    setStep(1);
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

  const progressPercent = (selectedSkins.length / requiredInputCount) * 100;

  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto max-w-[2100px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/70">
              Skin Browser
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Tradeup Builder
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base">
              Add inputs, review your contract, then calculate possible
              outcomes.
            </p>
          </div>

          <div className="rounded-full border border-white/10 bg-zinc-950/70 px-4 py-2 text-sm font-semibold text-zinc-300">
            {collections.length} Total Collections
          </div>
        </div>

        <div className="mb-6 rounded-[28px] border border-white/10 bg-zinc-950/70 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.25)]">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <StepButton
              step={1}
              currentStep={step}
              title="Select Inputs"
              subtitle={`${selectedSkins.length}/${requiredInputCount} skins added`}
              onClick={() => setStep(1)}
            />
            <StepButton
              step={2}
              currentStep={step}
              title="Review Contract"
              subtitle={
                isContractReady ? "Ready to review" : "Fill all input slots"
              }
              disabled={selectedSkins.length === 0}
              onClick={() => setStep(2)}
            />
            <StepButton
              step={3}
              currentStep={step}
              title="View Outcomes"
              subtitle={isContractReady ? "Odds unlocked" : "Needs 10 inputs"}
              disabled={!isContractReady}
              onClick={() => setStep(3)}
            />
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-cyan-300 transition-all duration-500"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
        </div>

        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${(step - 1) * 100}%)` }}
          >
            <div className="w-full shrink-0 pr-0">
              <section className="rounded-[28px] border border-white/10 bg-zinc-950/70 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.25)] sm:p-5">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <h2 className="text-2xl font-semibold tracking-tight text-white">
                    Select skins
                  </h2>

                  <div className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-zinc-300">
                    {isLoading ? "..." : `${displaySkins.length} results`}
                  </div>
                </div>

                <TradeupFilters
                  filters={filters}
                  collections={collections}
                  qualityOptions={qualityOptions}
                  onChange={handleFiltersChange}
                />

                <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="max-h-[calc(100vh-390px)] overflow-y-auto pr-1 custom-scrollbar">
                    {isLoading ? (
                      <div className="rounded-[24px] border border-white/10 bg-white/[0.03] px-6 py-12 text-center text-zinc-300">
                        Loading tradeup data from Firestore...
                      </div>
                    ) : pageError ? (
                      <div className="rounded-[24px] border border-red-400/20 bg-red-500/10 px-6 py-12 text-center text-red-100">
                        {pageError}
                      </div>
                    ) : filteredSkins.length === 0 ? (
                      <div className="rounded-[24px] border border-white/10 bg-white/[0.03] px-6 py-12 text-center text-zinc-300">
                        No tradeup skins found for the current filters.
                      </div>
                    ) : (
                      <TradeupSkinGrid
                        skins={displaySkins}
                        selectedSkins={selectedSkins}
                        selectedCount={selectedSkins.length}
                        onAddSkin={handleAddSkin}
                      />
                    )}
                  </div>

                  <SelectedTradeupSidebar
                    selectedSkins={selectedSkins}
                    requiredInputCount={requiredInputCount}
                    onRemoveSkin={handleRemoveSkin}
                    onClearSkins={handleClearSkins}
                  />
                </div>

                <FlowFooter
                  backLabel=""
                  nextLabel={
                    isContractReady ? "Review Contract" : "Add All Inputs"
                  }
                  nextDisabled={selectedSkins.length === 0}
                  onNext={() => setStep(2)}
                />
              </section>
            </div>

            <div className="w-full shrink-0 px-0">
              <div className="rounded-[28px] border border-white/10 bg-zinc-950/70 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.25)] sm:p-5">
                <TradeupBuilder
                  selectedSkins={selectedSkins}
                  requiredInputCount={requiredInputCount}
                  onRemoveSkin={handleRemoveSkin}
                  onClearSkins={handleClearSkins}
                  onDuplicateSkin={handleDuplicateSkin}
                  onUpdateSkinFloat={handleUpdateSkinFloat}
                />

                <FlowFooter
                  backLabel="Back to Skins"
                  nextLabel="Calculate Outcomes"
                  nextDisabled={!isContractReady}
                  onBack={() => setStep(1)}
                  onNext={() => setStep(3)}
                />
              </div>
            </div>

            <div className="w-full shrink-0 pl-0">
              <div className="rounded-[28px] border border-white/10 bg-zinc-950/70 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.25)] sm:p-5">
                <TradeupOutcomes calculation={calculation} />

                <FlowFooter
                  backLabel="Review Inputs"
                  nextLabel="Start New Tradeup"
                  onBack={() => setStep(2)}
                  onNext={handleClearSkins}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function StepButton({
  step,
  currentStep,
  title,
  subtitle,
  disabled = false,
  onClick,
}: {
  step: TradeupStep;
  currentStep: TradeupStep;
  title: string;
  subtitle: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  const isActive = step === currentStep;
  const isComplete = step < currentStep;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-[22px] border px-4 py-4 text-left transition disabled:cursor-not-allowed disabled:opacity-45 ${
        isActive
          ? "border-cyan-300/40 bg-cyan-300/10"
          : isComplete
            ? "border-emerald-300/25 bg-emerald-300/8"
            : "border-white/10 bg-white/[0.035] hover:bg-white/[0.06]"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
            isActive
              ? "bg-cyan-300 text-zinc-950"
              : isComplete
                ? "bg-emerald-300 text-zinc-950"
                : "bg-white/10 text-white"
          }`}
        >
          {isComplete ? "✓" : step}
        </span>

        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="mt-1 text-xs font-medium text-zinc-400">{subtitle}</p>
        </div>
      </div>
    </button>
  );
}

function FlowFooter({
  backLabel,
  nextLabel,
  nextDisabled = false,
  onBack,
  onNext,
}: {
  backLabel: string;
  nextLabel: string;
  nextDisabled?: boolean;
  onBack?: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-5">
      {backLabel ? (
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white"
        >
          ← {backLabel}
        </button>
      ) : (
        <div />
      )}

      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-bold text-zinc-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-45"
      >
        {nextLabel} →
      </button>
    </div>
  );
}

function SelectedTradeupSidebar({
  selectedSkins,
  requiredInputCount,
  onRemoveSkin,
  onClearSkins,
}: {
  selectedSkins: TradeupSkin[];
  requiredInputCount: number;
  onRemoveSkin: (index: number) => void;
  onClearSkins: () => void;
}) {
  return (
    <aside className="rounded-[24px] border border-white/10 bg-black/20 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Selected Inputs</h3>
          <p className="mt-1 text-xs font-medium text-zinc-500">
            {selectedSkins.length}/{requiredInputCount} contract slots
          </p>
        </div>

        <button
          type="button"
          onClick={onClearSkins}
          disabled={selectedSkins.length === 0}
          className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear Items
        </button>
      </div>

      <div className="custom-scrollbar max-h-[calc(100vh-520px)] space-y-2 overflow-y-auto pr-1">
        {selectedSkins.length === 0 ? (
          <div className="rounded-[18px] border border-dashed border-white/10 bg-white/[0.03] px-4 py-8 text-center text-sm font-semibold text-zinc-500">
            No skins selected yet.
          </div>
        ) : (
          selectedSkins.map((skin, index) => (
            <div
              key={`${skin.id}-${index}`}
              className="flex items-center gap-3 rounded-[16px] border border-white/10 bg-white/[0.04] p-2"
            >
              <div className="flex h-12 w-14 shrink-0 items-center justify-center rounded-xl bg-black/20">
                <img
                  src={skin.image}
                  alt={`${skin.weapon} | ${skin.name}`}
                  className="max-h-10 w-auto object-contain"
                  loading="lazy"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {skin.weapon}
                </p>
                <p className="truncate text-xs font-medium text-zinc-400">
                  {skin.name}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onRemoveSkin(index)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-red-400/20 bg-red-500/10 text-red-300 transition hover:bg-red-500/20 hover:text-red-200"
                aria-label={`Remove ${skin.weapon} ${skin.name}`}
              >
                🗑
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
