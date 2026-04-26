import { useMemo, useState } from "react";
import { useGameItems, gameItemCategories } from "../hooks/useGameItems";
import type { GameItem, GameItemCategory } from "../types/game-item";
import { Link } from "react-router-dom";

function SectionCard({ item }: { item: GameItem }) {
  const targetValue = item.sourceName ?? item.name.replace(/ Skins$/, "");
  const href = `/items/${encodeURIComponent(item.category)}/${encodeURIComponent(
    targetValue,
  )}`;

  return (
    <Link
      to={href}
      className="group flex min-h-[208px] flex-col overflow-hidden rounded-[30px] border border-white/10 bg-zinc-950/80 px-6 py-5 shadow-[0_18px_50px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-zinc-900/90"
    >
      <div>
        <h3 className="max-w-[170px] text-[1.15rem] font-semibold leading-[1.05] tracking-tight text-white sm:text-[1.25rem]">
          {item.name}
        </h3>

        <p className="mt-2 text-sm font-medium text-zinc-400">
          {item.itemCount} {item.itemCount === 1 ? "Item" : "Items"}
        </p>
      </div>

      <div className="mt-auto flex items-end justify-start pt-5">
        {item.colorHex ? (
          <div
            className="h-[92px] w-[92px] rounded-2xl border border-white/15"
            style={{ backgroundColor: item.colorHex }}
            aria-label={item.name}
          />
        ) : item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-[82px] w-auto object-contain transition duration-200 group-hover:scale-[1.02] sm:h-[92px]"
            loading="lazy"
          />
        ) : (
          <div className="h-[92px] w-[92px] rounded-2xl border border-white/10 bg-white/5" />
        )}
      </div>
    </Link>
  );
}

function Section({
  title,
  items,
}: {
  title: GameItemCategory;
  items: GameItem[];
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <section id={title} className="mb-12 scroll-mt-28">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[2.15rem] font-semibold leading-none tracking-tight text-white sm:text-[2.35rem]">
            {title}
          </h2>

          <p className="mt-2 text-lg text-zinc-500">
            {items.length} Categories
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-300 transition hover:bg-white/10 hover:text-white"
          aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${title}`}
          aria-expanded={!isCollapsed}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`h-5 w-5 transition-transform duration-200 ${
              isCollapsed ? "" : "rotate-180"
            }`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>

      {!isCollapsed && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
          {items.map((item) => (
            <SectionCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function GameItems() {
  const [search, setSearch] = useState("");
  const [isCategoryListOpen, setIsCategoryListOpen] = useState(false);

  const { groupedItems, loading, error } = useGameItems(search);

  const visibleCategories = useMemo(() => {
    return gameItemCategories.filter(
      (category) => groupedItems[category]?.length > 0,
    );
  }, [groupedItems]);

  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto max-w-[2100px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-start">
          <div className="w-full xl:w-[240px] xl:shrink-0">
            <div className="sticky top-24">
              <div className="xl:hidden">
                <div className="flex items-center gap-3">
                  <div className="flex-1 rounded-full border border-white/10 bg-zinc-950/70 px-4 py-3 shadow-[0_12px_35px_rgba(0,0,0,0.25)] backdrop-blur">
                    <input
                      type="text"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search..."
                      className="w-full bg-transparent text-sm font-medium text-white placeholder:text-zinc-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCategoryListOpen((prev) => !prev)}
                    className="shrink-0 rounded-full border border-white/10 bg-zinc-950/70 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_35px_rgba(0,0,0,0.25)] backdrop-blur transition hover:bg-zinc-900"
                  >
                    Categories
                  </button>
                </div>

                {isCategoryListOpen && (
                  <div className="mt-4 rounded-[24px] border border-white/10 bg-zinc-950/90 p-3 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur">
                    <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {visibleCategories.map((category) => (
                        <a
                          key={category}
                          href={`#${category}`}
                          onClick={() => setIsCategoryListOpen(false)}
                          className="rounded-xl px-4 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white"
                        >
                          {category}
                        </a>
                      ))}
                    </nav>
                  </div>
                )}
              </div>

              <aside className="hidden xl:block">
                <div className="mb-8 rounded-2xl border border-white/10 bg-zinc-950/70 px-4 py-3 shadow-[0_12px_35px_rgba(0,0,0,0.25)] backdrop-blur">
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search..."
                    className="w-full bg-transparent text-sm font-medium text-white placeholder:text-zinc-500 focus:outline-none"
                  />
                </div>

                <div>
                  <h2 className="mb-4 text-2xl font-semibold tracking-tight text-white">
                    Categories
                  </h2>

                  <nav className="space-y-1">
                    {visibleCategories.map((category) => (
                      <a
                        key={category}
                        href={`#${category}`}
                        className="flex w-full items-center rounded-xl px-4 py-3 text-left text-base font-medium text-zinc-400 transition hover:bg-white/10 hover:text-white"
                      >
                        {category}
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            {loading ? (
              <div className="rounded-[28px] border border-white/10 bg-zinc-950/70 px-6 py-16 text-center text-zinc-300">
                Loading game items from Firestore...
              </div>
            ) : error ? (
              <div className="rounded-[28px] border border-red-400/20 bg-red-500/10 px-6 py-16 text-center text-red-100">
                {error}
              </div>
            ) : visibleCategories.length === 0 ? (
              <div className="rounded-[28px] border border-white/10 bg-zinc-950/70 px-6 py-16 text-center text-zinc-300">
                No game items found.
              </div>
            ) : (
              visibleCategories.map((category) => (
                <Section
                  key={category}
                  title={category}
                  items={groupedItems[category]}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
