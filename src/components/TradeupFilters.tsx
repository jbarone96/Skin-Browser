import type { TradeupFiltersState, TradeupRarity } from "../types/tradeup";

interface TradeupFiltersProps {
  filters: TradeupFiltersState;
  collections: string[];
  qualityOptions: TradeupRarity[];
  onChange: (nextFilters: TradeupFiltersState) => void;
}

export default function TradeupFilters({
  filters,
  collections,
  qualityOptions,
  onChange,
}: TradeupFiltersProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">
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
          className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white placeholder:text-white/45 focus:border-white/20 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">
            Collection
          </label>
          <select
            value={filters.collection}
            onChange={(event) =>
              onChange({
                ...filters,
                collection: event.target.value,
              })
            }
            className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white focus:border-white/20 focus:outline-none"
          >
            <option value="All Collections">All Collections</option>
            {collections.map((collection) => (
              <option key={collection} value={collection}>
                {collection}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(event) =>
              onChange({
                ...filters,
                sortBy: event.target.value as TradeupFiltersState["sortBy"],
              })
            }
            className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white focus:border-white/20 focus:outline-none"
          >
            <option value="lowest-price">Cheapest</option>
            <option value="highest-price">Highest Price</option>
            <option value="lowest-float">Lowest Float</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">
            Quality
          </label>
          <select
            value={filters.quality}
            onChange={(event) =>
              onChange({
                ...filters,
                quality: event.target.value as TradeupRarity,
              })
            }
            className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white focus:border-white/20 focus:outline-none"
          >
            {qualityOptions.map((quality) => (
              <option key={quality} value={quality}>
                {quality}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
