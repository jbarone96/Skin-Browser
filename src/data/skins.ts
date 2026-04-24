import type { Skin, Wear } from "../types/skin";

type ApiSkin = {
  id: string;
  name: string;
  image: string;
  weapon?: {
    name?: string;
  };
};

const SKINS_API_URL =
  "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins_not_grouped.json";

const knownWears: Wear[] = [
  "Factory New",
  "Minimal Wear",
  "Field-Tested",
  "Well-Worn",
  "Battle-Scarred",
];

function parseWear(name: string): Wear {
  const matchedWear = knownWears.find((wear) => name.includes(`(${wear})`));
  return matchedWear ?? "Unknown";
}

function stripWearSuffix(name: string): string {
  return name.replace(
    /\s+\((Factory New|Minimal Wear|Field-Tested|Well-Worn|Battle-Scarred)\)$/,
    "",
  );
}

function stripStatTrakPrefix(name: string): string {
  return name.replace(/^StatTrak™\s+/, "");
}

function getSkinName(fullName: string, weaponName: string): string {
  const withoutWear = stripWearSuffix(fullName);
  const withoutPrefix = stripStatTrakPrefix(withoutWear);
  const expectedPrefix = `${weaponName} | `;

  if (withoutPrefix.startsWith(expectedPrefix)) {
    return withoutPrefix.slice(expectedPrefix.length);
  }

  return withoutPrefix;
}

function mapApiSkinToSkin(apiSkin: ApiSkin): Skin {
  const weapon = apiSkin.weapon?.name?.trim() || "Unknown";
  const wear = parseWear(apiSkin.name);
  const name = getSkinName(apiSkin.name, weapon);

  return {
    id: apiSkin.id,
    name,
    weapon,
    wear,
    price: null,
    image: apiSkin.image,
  };
}

export async function fetchSkins(): Promise<Skin[]> {
  const response = await fetch(SKINS_API_URL);

  if (!response.ok) {
    throw new Error(`Failed to fetch skins: ${response.status}`);
  }

  const data = (await response.json()) as ApiSkin[];

  return data
    .filter((item) => Boolean(item.image && item.name))
    .map(mapApiSkinToSkin);
}
