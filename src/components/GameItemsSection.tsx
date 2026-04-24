import { useState } from "react";
import type { GameItem } from "../types/game-item";

interface GameItemsSectionProps {
  title: string;
  items: GameItem[];
  defaultCollapsed?: boolean;
}

export default function GameItemsSection({
  title,
  items,
  defaultCollapsed = false,
}: GameItemsSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <section id={title} className="mb-12 scroll-mt-24">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[2.15rem] font-semibold leading-none tracking-tight text-white sm:text-[2.35rem]">
            {title}
          </h2>
          <p className="mt-2 text-lg text-white/45">
            {items.length} Categories
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/75 transition hover:bg-white/8 hover:text-white"
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
            <article
              key={item.id}
              className="group flex min-h-[208px] flex-col overflow-hidden rounded-[30px] bg-black px-6 py-5 transition hover:-translate-y-0.5 hover:bg-black/95"
            >
              <div>
                <h3 className="max-w-[170px] text-[1.15rem] font-semibold leading-[1.05] tracking-tight text-white sm:text-[1.25rem]">
                  {item.name}
                </h3>
                <p className="mt-2 text-sm font-medium text-white/72">
                  {item.itemCount} Items
                </p>
              </div>

              <div className="mt-auto flex items-end justify-start pt-5">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-[82px] w-auto object-contain transition duration-200 group-hover:scale-[1.02] sm:h-[92px]"
                  loading="lazy"
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
