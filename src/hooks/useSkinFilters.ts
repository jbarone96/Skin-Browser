import { useMemo, useState } from "react";
import { useSkins } from "./useSkins";
import { filterSkins } from "../utils/filterSkins";

export function useSkinFilters() {
  const { skins, isLoading, error } = useSkins();

  const [search, setSearch] = useState("");
  const [weapon, setWeapon] = useState("All");
  const [wear, setWear] = useState("All");

  const filteredSkins = useMemo(() => {
    return filterSkins(skins, { search, weapon, wear });
  }, [skins, search, weapon, wear]);

  const weapons = useMemo(() => {
    return ["All", ...new Set(skins.map((skin) => skin.weapon))];
  }, [skins]);

  const wears = useMemo(() => {
    return ["All", ...new Set(skins.map((skin) => skin.wear))];
  }, [skins]);

  return {
    search,
    setSearch,
    weapon,
    setWeapon,
    wear,
    setWear,
    weapons,
    wears,
    filteredSkins,
    isLoading,
    error,
  };
}
