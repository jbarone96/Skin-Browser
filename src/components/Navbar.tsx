import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { FaSteam } from "react-icons/fa";
import { useSteamAuth } from "../hooks/useSteamAuth";
import { useSkins } from "../hooks/useSkins";
import LocaleDropdown from "./LocaleDropdown";
import SearchBar from "./SearchBar";
import logo from "../assets/images/logo.png";

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
  return [
    "rounded-full px-3.5 py-2 text-sm font-medium transition",
    isActive
      ? "bg-white/10 text-white shadow-sm shadow-cyan-500/10"
      : "text-zinc-400 hover:bg-white/5 hover:text-white",
  ].join(" ");
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === "/";

  const { user, isAuthenticated, isLoading, signIn, signOut } = useSteamAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { skins } = useSkins({
    search: "",
    weapon: "All",
    wear: "All",
  });

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function handleSelectSkin(skinId: string) {
    setSearch("");
    closeMenu();
    navigate(`/skin/${skinId}`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070b18]/85 backdrop-blur-2xl">
      <div className="mx-auto max-w-[2100px] px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-20 items-center justify-between gap-4">
          <div className="flex min-w-0 shrink-0 items-center gap-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex items-center justify-center">
                <img
                  src={logo}
                  alt="Skin Browser logo"
                  className="h-24 w-24 object-contain"
                />
              </div>

              <div className="hidden leading-tight sm:block">
                <p className="text-sm font-bold tracking-wide text-white">
                  Skin Browser
                </p>
                <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-300/70">
                  CS2 Skins
                </p>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 lg:flex">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.href}
                  className={navLinkClass}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="relative flex min-w-0 flex-1 items-center justify-end gap-3">
            {!isHomePage && (
              <div className="hidden w-full max-w-[560px] min-w-[260px] xl:block">
                <SearchBar
                  value={search}
                  onChange={setSearch}
                  skins={skins}
                  onSelectSkin={handleSelectSkin}
                  compact
                />
              </div>
            )}

            <div className="hidden shrink-0 lg:block">
              <LocaleDropdown />
            </div>

            {isLoading ? (
              <div className="hidden shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-400 lg:block">
                Checking...
              </div>
            ) : isAuthenticated && user ? (
              <div className="hidden shrink-0 items-center gap-2 lg:flex">
                <a
                  href={user.profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-1.5 pr-3 transition hover:border-cyan-300/30 hover:bg-white/10"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/10 text-xs font-bold text-cyan-300">
                      {user.displayName.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <span className="max-w-[150px] truncate text-sm font-semibold text-white">
                    {user.displayName}
                  </span>
                </a>

                <button
                  onClick={() => void signOut()}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/10 hover:text-white"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={signIn}
                className="hidden shrink-0 items-center gap-2 rounded-full bg-[#171a21] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1f2530] lg:flex"
              >
                <FaSteam className="text-lg" />
                <span>Sign in</span>
              </button>
            )}

            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white transition hover:bg-white/10 lg:hidden"
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
                  className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                  onClick={closeMenu}
                />

                <div className="absolute right-0 top-16 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-[#090d1a]/95 p-4 shadow-2xl shadow-black/40 backdrop-blur-2xl">
                  <div className="space-y-4">
                    {!isHomePage && (
                      <SearchBar
                        value={search}
                        onChange={setSearch}
                        skins={skins}
                        onSelectSkin={handleSelectSkin}
                        compact
                      />
                    )}

                    <LocaleDropdown variant="mobile" />

                    {isLoading ? (
                      <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-400">
                        Checking Steam session...
                      </div>
                    ) : isAuthenticated && user ? (
                      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.displayName}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10 text-sm font-bold text-cyan-300">
                              {user.displayName.slice(0, 2).toUpperCase()}
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">
                              {user.displayName}
                            </p>
                            <p className="truncate text-xs text-zinc-500">
                              {user.steamId}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            void signOut();
                            closeMenu();
                          }}
                          className="mt-3 w-full rounded-xl bg-white/5 py-2 text-sm font-medium text-white transition hover:bg-white/10"
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
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#171a21] py-3 text-sm font-semibold text-white transition hover:bg-[#1f2530]"
                      >
                        <FaSteam className="text-lg" />
                        Sign in with Steam
                      </button>
                    )}

                    <div className="space-y-1">
                      {NAV_ITEMS.map((item) => (
                        <NavLink
                          key={item.label}
                          to={item.href}
                          className={({ isActive }) =>
                            `block rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                              isActive
                                ? "bg-white/10 text-white"
                                : "text-zinc-300 hover:bg-white/5 hover:text-white"
                            }`
                          }
                        >
                          {item.label}
                        </NavLink>
                      ))}
                    </div>

                    <div className="space-y-1 border-t border-white/10 pt-3">
                      {SECONDARY_ITEMS.map((item) => (
                        <NavLink
                          key={item.label}
                          to={item.href}
                          className={({ isActive }) =>
                            `block rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                              isActive
                                ? "bg-white/10 text-white"
                                : "text-zinc-400 hover:bg-white/5 hover:text-white"
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
      </div>
    </header>
  );
}
