import type { GameItem, GameItemCategory } from "../types/game-item";

export const gameItemCategories: GameItemCategory[] = [
  "Knives",
  "Gloves",
  "Pistols",
  "Rifles",
  "SMGs",
  "Heavy",
  "Weapon Cases",
  "Souvenir Cases",
  "Collections",
  "Stickers",
  "Other",
  "Colors",
];

export const gameItems: GameItem[] = [
  {
    id: "bayonet",
    name: "Bayonet Skins",
    category: "Knives",
    itemCount: 35,
    image:
      "https://community.fastly.steamstatic.com/economy/image/class/730/1729058602/360fx360f",
  },
  {
    id: "karambit",
    name: "Karambit Skins",
    category: "Knives",
    itemCount: 35,
    image:
      "https://community.fastly.steamstatic.com/economy/image/class/730/1729053766/360fx360f",
  },
  {
    id: "butterfly-knife",
    name: "Butterfly Knife Skins",
    category: "Knives",
    itemCount: 35,
    image:
      "https://community.fastly.steamstatic.com/economy/image/class/730/1729037305/360fx360f",
  },
  {
    id: "sport-gloves",
    name: "Sport Gloves",
    category: "Gloves",
    itemCount: 24,
    image:
      "https://community.fastly.steamstatic.com/economy/image/class/730/1729078335/360fx360f",
  },
  {
    id: "driver-gloves",
    name: "Driver Gloves",
    category: "Gloves",
    itemCount: 24,
    image:
      "https://community.fastly.steamstatic.com/economy/image/class/730/1729072335/360fx360f",
  },
];
