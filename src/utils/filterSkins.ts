import type { Skin } from "../types/skin";

type FilterParams = {
  search: string;
  weapon: string;
  wear: string;
};

export function filterSkins(
  skins: Skin[],
  { search, weapon, wear }: FilterParams,
): Skin[] {
  const normalizedSearch = search.trim().toLowerCase();

  return skins.filter((skin) => {
    const matchesSearch =
      normalizedSearch === "" ||
      skin.name.toLowerCase().includes(normalizedSearch) ||
      skin.weapon.toLowerCase().includes(normalizedSearch);

    const matchesWeapon = weapon === "All" || skin.weapon === weapon;
    const matchesWear = wear === "All" || skin.wear === wear;

    return matchesSearch && matchesWeapon && matchesWear;
  });
}
