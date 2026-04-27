import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { FaChevronDown } from "react-icons/fa";
import type { TradeupFiltersState, TradeupRarity } from "../types/tradeup";

interface TradeupFiltersProps {
  filters: TradeupFiltersState;
  collections: string[];
  qualityOptions: TradeupRarity[];
  onChange: (nextFilters: TradeupFiltersState) => void;
}

type FilterDropdownProps<T extends string> = {
  label: string;
  value: T;
  options: T[];
  onChange: (value: T) => void;
};

function FilterDropdown<T extends string>({
  label,
  value,
  options,
  onChange,
}: FilterDropdownProps<T>) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">
        {label}
      </label>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-gradient-to-b from-white/10 to-white/[0.03] px-4 py-3 text-sm font-medium text-white shadow-inner shadow-white/5 transition hover:border-white/20 hover:from-white/15 focus:outline-none focus:ring-2 focus:ring-cyan-400/20">
            <span className="truncate">{value}</span>
            <FaChevronDown className="ml-auto shrink-0 text-[10px] text-zinc-400" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            sideOffset={8}
            align="end"
            className="custom-scrollbar z-[999] max-h-80 w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto rounded-2xl border border-white/10 bg-[#080d18]/95 p-2 shadow-2xl shadow-black/50 outline-none backdrop-blur-2xl data-[state=open]:animate-[localeDropdownIn_160ms_ease-out] data-[state=closed]:animate-[localeDropdownOut_120ms_ease-in]"
          >
            {options.map((option) => (
              <DropdownMenu.Item
                key={option}
                onClick={() => onChange(option)}
                className={`flex cursor-pointer select-none items-center justify-between rounded-xl px-4 py-3 text-sm outline-none transition ${
                  value === option
                    ? "bg-cyan-400/10 text-cyan-300"
                    : "text-zinc-300 hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white"
                }`}
              >
                <span className="truncate">{option}</span>
                {value === option && <span className="text-cyan-300">✓</span>}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}

export default function TradeupFilters({
  filters,
  collections,
  qualityOptions,
  onChange,
}: TradeupFiltersProps) {
  const collectionOptions = ["All Collections", ...collections];

  const sortOptions: TradeupFiltersState["sortBy"][] = [
    "lowest-price",
    "highest-price",
  ];

  const sortLabels: Record<TradeupFiltersState["sortBy"], string> = {
    "lowest-price": "Lowest Price",
    "highest-price": "Highest Price",
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">
          Search
        </label>

        <input
          type="text"
          value={filters.search}
          onChange={(event) =>
            onChange({
              ...filters,
              search: event.target.value,
            })
          }
          placeholder="Enter skin name"
          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium text-white placeholder:text-white/40 transition focus:border-cyan-400/40 focus:bg-black/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/10"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        <FilterDropdown
          label="Collection"
          value={filters.collection}
          options={collectionOptions}
          onChange={(collection) =>
            onChange({
              ...filters,
              collection,
            })
          }
        />

        <FilterDropdown
          label="Sort By"
          value={sortLabels[filters.sortBy]}
          options={sortOptions.map((option) => sortLabels[option])}
          onChange={(label) => {
            const nextSort =
              sortOptions.find((option) => sortLabels[option] === label) ??
              "lowest-price";

            onChange({
              ...filters,
              sortBy: nextSort,
            });
          }}
        />

        <FilterDropdown
          label="Quality"
          value={filters.quality}
          options={qualityOptions}
          onChange={(quality) =>
            onChange({
              ...filters,
              quality,
            })
          }
        />
      </div>
    </div>
  );
}
