import type { GameItemCategory } from "../types/game-item";

interface GameItemsSidebarProps {
  categories: GameItemCategory[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function GameItemsSidebar({
  categories,
  searchValue,
  onSearchChange,
  isOpen,
  onToggle,
}: GameItemsSidebarProps) {
  return (
    <>
      <div className="xl:hidden">
        <div className="flex items-center gap-3">
          <div className="flex-1 rounded-full bg-white/10 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4 text-white/75"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>

              <input
                type="text"
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent text-sm font-medium text-white placeholder:text-white/65 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onToggle}
            className="shrink-0 rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm transition hover:bg-white/14"
            aria-expanded={isOpen}
            aria-label="Toggle category list"
          >
            Categories
          </button>
        </div>

        {isOpen && (
          <div className="mt-4 rounded-[24px] bg-black/30 p-3 backdrop-blur-sm">
            <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {categories.map((category) => (
                <a
                  key={category}
                  href={`#${category}`}
                  onClick={onToggle}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-white/85 transition hover:bg-white/8 hover:text-white"
                >
                  {category}
                </a>
              ))}
            </nav>
          </div>
        )}
      </div>

      <aside className="hidden xl:block xl:w-[220px] xl:shrink-0">
        <div className="sticky top-24">
          <div className="mb-8">
            <div className="rounded-2xl bg-white/10 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4 text-white/75"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>

                <input
                  type="text"
                  value={searchValue}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Search..."
                  className="w-full bg-transparent text-sm font-medium text-white placeholder:text-white/55 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-2xl font-semibold tracking-tight text-white">
              Categories
            </h2>

            <nav className="space-y-1">
              {categories.map((category) => (
                <a
                  key={category}
                  href={`#${category}`}
                  className="flex w-full items-center rounded-xl px-4 py-3 text-left text-base font-medium text-white/85 transition hover:bg-white/6 hover:text-white"
                >
                  {category}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
}
