import { useMemo, useState } from "react";
import type { SkinReference } from "../types/skin";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  skins: SkinReference[];
  onSelectSkin: (skinId: string) => void;
  compact?: boolean;
};

function fuzzyMatch(text: string, query: string) {
  const normalizedText = text.toLowerCase();
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) return true;

  let queryIndex = 0;

  for (let i = 0; i < normalizedText.length; i += 1) {
    if (normalizedText[i] === normalizedQuery[queryIndex]) {
      queryIndex += 1;
    }

    if (queryIndex === normalizedQuery.length) {
      return true;
    }
  }

  return false;
}

export default function SearchBar({
  value,
  onChange,
  skins,
  onSelectSkin,
  compact = false,
}: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const results = useMemo(() => {
    const query = value.trim();

    if (!query) return [];

    return skins
      .filter((skin) => {
        const searchableText = [
          skin.fullName,
          skin.weaponType,
          skin.collection,
          skin.rarity,
        ]
          .filter(Boolean)
          .join(" ");

        return fuzzyMatch(searchableText, query);
      })
      .slice(0, 30);
  }, [skins, value]);

  return (
    <div className="relative w-full">
      {/* LABEL (hidden in compact mode) */}
      {!compact && (
        <label
          htmlFor="skin-search"
          className="mb-2 block text-sm font-medium text-zinc-300"
        >
          Search
        </label>
      )}

      {/* INPUT */}
      <input
        id="skin-search"
        type="text"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setIsOpen(false), 120);
        }}
        placeholder="Search skins..."
        className={`w-full ${
          compact ? "h-11 rounded-full px-5" : "rounded-xl px-4 py-3"
        } border border-white/10 bg-black/20 text-white placeholder:text-zinc-500 transition focus:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/10`}
      />

      {/* DROPDOWN */}
      {isOpen && value.trim() && (
        <div
          className={`absolute left-0 right-0 ${
            compact ? "top-[52px]" : "top-[78px]"
          } z-50 max-h-80 overflow-y-auto rounded-2xl border border-white/10 bg-[#080d18]/95 p-2 shadow-2xl shadow-black/50 backdrop-blur-2xl`}
        >
          {results.length > 0 ? (
            results.map((skin) => (
              <button
                key={skin.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelectSkin(skin.id);
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-white/10"
              >
                <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-white/5">
                  <img
                    src={skin.image}
                    alt={skin.fullName}
                    className="max-h-10 max-w-14 object-contain"
                    loading="lazy"
                  />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {skin.fullName}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-zinc-400">
                    {skin.weaponType}
                    {skin.collection ? ` • ${skin.collection}` : ""}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-sm text-zinc-400">
              No skins found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
