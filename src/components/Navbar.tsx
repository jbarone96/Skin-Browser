import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useSteamAuth } from "../hooks/useSteamAuth";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Tradeup", href: "/tradeup" },
  { label: "Inventory", href: "/inventory" },
  { label: "Game Items", href: "/items" },
];

const SECONDARY_ITEMS = [
  { label: "Contact", href: "/contact" },
  { label: "About", href: "/about" },
];

function navLinkClass({ isActive }: { isActive: boolean }) {
  return isActive ? "text-white" : "text-zinc-300 transition hover:text-white";
}

export default function Navbar() {
  const { user, isAuthenticated, isLoading, signIn, signOut } = useSteamAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3" onClick={closeMenu}>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600">
              <span className="font-bold text-white">SB</span>
            </div>

            <span className="hidden font-bold text-white sm:block">
              Skin Browser
            </span>
          </Link>

          <nav className="hidden gap-6 lg:flex">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.label} to={item.href} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="relative flex items-center gap-3">
          <button className="hidden rounded-full bg-white/5 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 xl:flex">
            Search...
          </button>

          {!isLoading && !isAuthenticated && (
            <button
              onClick={signIn}
              className="hidden rounded-full bg-emerald-500/10 px-4 py-2 text-white hover:bg-emerald-500/20 lg:block"
            >
              Sign in
            </button>
          )}

          {isLoading ? (
            <div className="hidden rounded-full bg-white/5 px-4 py-2 text-sm text-zinc-400 lg:block">
              Loading...
            </div>
          ) : isAuthenticated && user ? (
            <div className="hidden items-center gap-3 lg:flex">
              <a
                href={user.profileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 transition hover:bg-white/10"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.displayName}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700 text-xs font-semibold text-white">
                    {user.displayName.slice(0, 2).toUpperCase()}
                  </div>
                )}

                <span className="hidden max-w-[140px] truncate text-sm font-medium text-white xl:block">
                  {user.displayName}
                </span>
              </a>

              <button
                onClick={() => void signOut()}
                className="rounded-full bg-white/5 px-4 py-2 text-white hover:bg-white/10"
              >
                Sign out
              </button>
            </div>
          ) : null}

          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white lg:hidden"
          >
            <span className="relative block h-5 w-5">
              <span
                className={`absolute left-0 top-0 h-0.5 w-5 rounded-full bg-white transition duration-200 ${
                  isMenuOpen ? "translate-y-2 rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-2 h-0.5 w-5 rounded-full bg-white transition duration-200 ${
                  isMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-4 h-0.5 w-5 rounded-full bg-white transition duration-200 ${
                  isMenuOpen ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </span>
          </button>

          {isMenuOpen && (
            <>
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={closeMenu}
              />

              <div className="absolute right-0 top-16 z-50 w-72 rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur-xl">
                <div className="space-y-4 p-4">
                  <button className="w-full rounded-xl bg-white/5 px-4 py-3 text-left text-zinc-300 hover:bg-white/10">
                    Search skins...
                  </button>

                  <div>
                    {isLoading ? (
                      <div className="text-zinc-400">Loading...</div>
                    ) : isAuthenticated && user ? (
                      <div className="space-y-3">
                        <div className="rounded-xl bg-white/5 px-4 py-3">
                          <div className="text-sm text-white">
                            {user.displayName}
                          </div>
                          <div className="mt-1 truncate text-xs text-zinc-400">
                            {user.steamId}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            void signOut();
                            closeMenu();
                          }}
                          className="w-full rounded-xl bg-white/5 py-2 text-white hover:bg-white/10"
                        >
                          Sign out
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          closeMenu();
                          signIn();
                        }}
                        className="w-full rounded-xl bg-emerald-500/10 py-2 text-white hover:bg-emerald-500/20"
                      >
                        Sign in with Steam
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {NAV_ITEMS.map((item) => (
                      <NavLink
                        key={item.label}
                        to={item.href}
                        onClick={closeMenu}
                        className={({ isActive }) =>
                          `block rounded-xl px-4 py-2 ${
                            isActive
                              ? "bg-white/10 text-white"
                              : "text-zinc-300 hover:bg-white/5"
                          }`
                        }
                      >
                        {item.label}
                      </NavLink>
                    ))}
                  </div>

                  <div className="space-y-2 border-t border-white/10 pt-3">
                    {SECONDARY_ITEMS.map((item) => (
                      <NavLink
                        key={item.label}
                        to={item.href}
                        onClick={closeMenu}
                        className={({ isActive }) =>
                          `block rounded-xl px-4 py-2 ${
                            isActive
                              ? "bg-white/10 text-white"
                              : "text-zinc-400 hover:bg-white/5"
                          }`
                        }
                      >
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
