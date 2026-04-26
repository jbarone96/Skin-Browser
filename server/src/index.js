const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const session = require("express-session");
const SteamSignIn = require("steam-signin");
const https = require("https");

dotenv.config();

const PORT = Number(process.env.PORT || 3001);
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";
const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET) {
  throw new Error("Missing SESSION_SECRET in server/.env");
}

const app = express();
const steamSignIn = new SteamSignIn(BACKEND_URL);
const FLOAT_CACHE = new Map();
const PRICE_CACHE = new Map();
const PRICE_CACHE_TTL_MS = 1000 * 60 * 30;

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: "2mb" }));

app.use(
  session({
    name: "skinbrowser.sid",
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);

async function fetchWithTimeout(url, options = {}, timeoutMs = 12000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function httpsGetJson(url, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const request = https.get(
      url,
      {
        timeout: timeoutMs,
        headers: {
          "User-Agent": "Mozilla/5.0 SkinBrowser/1.0",
          Accept: "application/json",
          Authorization: process.env.CSFLOAT_API_KEY,
        },
      },
      (response) => {
        let body = "";

        response.on("data", (chunk) => {
          body += chunk;
        });

        response.on("end", () => {
          if (response.statusCode < 200 || response.statusCode >= 300) {
            return reject(
              new Error(
                `HTTPS ${response.statusCode} ${response.statusMessage} ${body.slice(
                  0,
                  250,
                )}`,
              ),
            );
          }

          try {
            return resolve(JSON.parse(body));
          } catch (error) {
            return reject(new Error(`Invalid JSON response: ${error.message}`));
          }
        });
      },
    );

    request.on("timeout", () => {
      request.destroy(new Error("HTTPS request timed out."));
    });

    request.on("error", (error) => {
      reject(error);
    });
  });
}

function getFallbackSteamProfile(steamId64) {
  return {
    steamId: steamId64,
    displayName: steamId64,
    avatar: "",
    profileUrl: `https://steamcommunity.com/profiles/${steamId64}`,
  };
}

function decodeXmlValue(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

function getXmlTag(xml, tagName) {
  const cdataMatch = xml.match(
    new RegExp(`<${tagName}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tagName}>`),
  );

  if (cdataMatch?.[1]) return cdataMatch[1].trim();

  const normalMatch = xml.match(
    new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`),
  );

  if (normalMatch?.[1]) return decodeXmlValue(normalMatch[1].trim());

  return "";
}

function getSteamLoginUrl(returnUrl) {
  const url = new URL("https://steamcommunity.com/openid/login");

  url.searchParams.set("openid.ns", "http://specs.openid.net/auth/2.0");
  url.searchParams.set("openid.mode", "checkid_setup");
  url.searchParams.set(
    "openid.claimed_id",
    "http://specs.openid.net/auth/2.0/identifier_select",
  );
  url.searchParams.set(
    "openid.identity",
    "http://specs.openid.net/auth/2.0/identifier_select",
  );
  url.searchParams.set("openid.return_to", returnUrl);
  url.searchParams.set("openid.realm", BACKEND_URL);

  return url.toString();
}

async function getSteamProfile(steamId64) {
  const fallbackProfile = getFallbackSteamProfile(steamId64);

  try {
    const response = await fetchWithTimeout(
      `https://steamcommunity.com/profiles/${steamId64}?xml=1`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 SkinBrowser/1.0",
          Accept: "application/json",
          Authorization: process.env.CSFLOAT_API_KEY,
        },
      },
    );

    if (!response.ok) return fallbackProfile;

    const xml = await response.text();

    return {
      steamId: steamId64,
      displayName: getXmlTag(xml, "steamID") || steamId64,
      avatar: getXmlTag(xml, "avatarFull"),
      profileUrl: `https://steamcommunity.com/profiles/${steamId64}`,
    };
  } catch (error) {
    console.warn("Steam profile XML fetch failed. Using fallback:", error);
    return fallbackProfile;
  }
}

function requireAuth(req, res, next) {
  if (!req.session.user?.steamId) {
    return res.status(401).json({
      message: "You must be signed in with Steam.",
    });
  }

  return next();
}

function safeInstanceId(item) {
  return item?.instanceid || "0";
}

function getDescriptionKey(item) {
  return `${item.classid}_${safeInstanceId(item)}`;
}

function getClassOnlyKey(item) {
  return `${item.classid}`;
}

function getDescriptionForAsset(
  asset,
  descriptionMap,
  classOnlyDescriptionMap,
) {
  return (
    descriptionMap.get(getDescriptionKey(asset)) ||
    classOnlyDescriptionMap.get(getClassOnlyKey(asset)) ||
    null
  );
}
function decodeHtml(value = "") {
  return String(value)
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

function stripHtml(value = "") {
  return decodeHtml(String(value).replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function getImageUrlsFromHtml(value = "") {
  const urls = [];
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;

  let match = imgRegex.exec(value);

  while (match) {
    urls.push(match[1]);
    match = imgRegex.exec(value);
  }

  return urls;
}

function parseAppliedItems(description) {
  const rows = Array.isArray(description?.descriptions)
    ? description.descriptions
    : [];

  const appliedItems = [];

  rows.forEach((row) => {
    const rawValue = String(row?.value || "");
    const cleanValue = stripHtml(rawValue);

    const lowerValue = cleanValue.toLowerCase();
    const isStickerRow = lowerValue.includes("sticker:");
    const isCharmRow = lowerValue.includes("charm:");

    if (!isStickerRow && !isCharmRow) return;

    const type = isStickerRow ? "sticker" : "charm";
    const labelRegex = isStickerRow ? /sticker:/i : /charm:/i;

    const names =
      cleanValue
        .split(labelRegex)
        .at(1)
        ?.split(",")
        .map((name) => name.trim())
        .filter(Boolean) ?? [];

    const imageUrls = getImageUrlsFromHtml(rawValue);

    names.forEach((name, index) => {
      appliedItems.push({
        type,
        name,
        imageUrl: imageUrls[index] || "",
      });
    });
  });

  return appliedItems;
}

function getInspectLink(asset, description, steamId64) {
  const actions = [
    ...(Array.isArray(description?.actions) ? description.actions : []),
    ...(Array.isArray(description?.owner_actions)
      ? description.owner_actions
      : []),
    ...(Array.isArray(description?.market_actions)
      ? description.market_actions
      : []),
    ...(Array.isArray(asset?.actions) ? asset.actions : []),
    ...(Array.isArray(asset?.owner_actions) ? asset.owner_actions : []),
    ...(Array.isArray(asset?.market_actions) ? asset.market_actions : []),
  ];

  const inspectAction = actions.find((action) => {
    const link = String(action?.link || "").toLowerCase();
    const name = String(action?.name || "").toLowerCase();

    return link.includes("inspect") || name.includes("inspect");
  });

  if (!inspectAction?.link) {
    return "";
  }

  return inspectAction.link
    .replaceAll("%owner_steamid%", steamId64)
    .replaceAll("%assetid%", asset.assetid)
    .replaceAll("%contextid%", "2")
    .replaceAll("%appid%", "730");
}

function normalizeInventoryItem(asset, description, steamId64) {
  const tags = Array.isArray(description?.tags) ? description.tags : [];

  const typeTag = tags.find((tag) => tag.category === "Type");
  const rarityTag = tags.find((tag) => tag.category === "Rarity");
  const weaponTag = tags.find((tag) => tag.category === "Weapon");
  const collectionTag = tags.find((tag) => tag.category === "ItemSet");
  const exteriorTag = tags.find((tag) => tag.category === "Exterior");

  return {
    assetId: asset.assetid,
    classId: asset.classid,
    instanceId: safeInstanceId(asset),
    amount: Math.max(1, Number(asset.amount || 1)),
    name:
      description?.market_hash_name ||
      description?.market_name ||
      description?.name ||
      `Unknown CS2 Item (${asset.classid})`,
    marketName: description?.market_name || description?.market_hash_name || "",
    type: typeTag?.localized_tag_name || description?.type || "CS2 Item",
    rarity: rarityTag?.localized_tag_name || "",
    weapon: weaponTag?.localized_tag_name || "",
    collection: collectionTag?.localized_tag_name || "",
    exterior: exteriorTag?.localized_tag_name || "",
    tradable: Number(description?.tradable || 0) === 1,
    marketable: Number(description?.marketable || 0) === 1,
    inspectLink: getInspectLink(asset, description, steamId64),
    appliedItems: parseAppliedItems(description),
    imageUrl: description?.icon_url
      ? `https://community.cloudflare.steamstatic.com/economy/image/${description.icon_url}/360fx360f`
      : "",
    marketUrl: description?.market_hash_name
      ? `https://steamcommunity.com/market/listings/730/${encodeURIComponent(
          description.market_hash_name,
        )}`
      : "",
  };
}

function mergeInventoryData(primaryData, secondaryData) {
  const assetMap = new Map();
  const descriptionMap = new Map();

  const addData = (data, source) => {
    const assets = Array.isArray(data?.assets) ? data.assets : [];
    const descriptions = Array.isArray(data?.descriptions)
      ? data.descriptions
      : [];

    assets.forEach((asset) => {
      if (!asset?.assetid) return;

      if (!assetMap.has(asset.assetid)) {
        assetMap.set(asset.assetid, { ...asset, source });
      }
    });

    descriptions.forEach((description) => {
      if (!description?.classid) return;

      const key = getDescriptionKey(description);

      if (!descriptionMap.has(key)) {
        descriptionMap.set(key, description);
      }
    });
  };

  addData(primaryData, "json");
  addData(secondaryData, "html");

  return {
    total_inventory_count: Math.max(
      Number(primaryData?.total_inventory_count || 0),
      Number(secondaryData?.total_inventory_count || 0),
      assetMap.size,
    ),
    assets: Array.from(assetMap.values()),
    descriptions: Array.from(descriptionMap.values()),
  };
}

async function fetchSteamInventoryModern(steamId64) {
  console.log("Using paginated inventory fetch v4");

  const allAssets = [];
  const allDescriptions = [];
  let totalInventoryCount = 0;
  let startAssetId = "";
  let page = 1;

  while (page <= 10) {
    const url = new URL(
      `https://steamcommunity.com/inventory/${steamId64}/730/2`,
    );

    url.searchParams.set("l", "english");
    url.searchParams.set("count", "75");

    if (startAssetId) {
      url.searchParams.set("start_assetid", startAssetId);
    }

    const response = await fetchWithTimeout(url.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 SkinBrowser/1.0",
        Accept: "application/json",
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(
        `Modern inventory endpoint failed: ${response.status} ${response.statusText} ${body}`,
      );
    }

    const data = await response.json();

    const pageAssets = Array.isArray(data.assets) ? data.assets : [];
    const pageDescriptions = Array.isArray(data.descriptions)
      ? data.descriptions
      : [];

    allAssets.push(...pageAssets);
    allDescriptions.push(...pageDescriptions);

    totalInventoryCount = data.total_inventory_count || totalInventoryCount;

    const fallbackLastAssetId =
      pageAssets.length > 0 ? pageAssets[pageAssets.length - 1].assetid : "";

    const nextStartAssetId = data.last_assetid || fallbackLastAssetId;

    const stillMissingItems =
      totalInventoryCount > 0 && allAssets.length < totalInventoryCount;

    console.log("Steam inventory page:", {
      page,
      pageAssets: pageAssets.length,
      totalLoaded: allAssets.length,
      steamTotal: totalInventoryCount,
      moreItems: data.more_items,
      lastAssetId: data.last_assetid,
      fallbackLastAssetId,
      nextStartAssetId,
      stillMissingItems,
    });

    if (!nextStartAssetId || !stillMissingItems) break;
    if (startAssetId === nextStartAssetId) break;

    startAssetId = nextStartAssetId;
    page += 1;
  }

  const uniqueAssets = Array.from(
    new Map(allAssets.map((asset) => [asset.assetid, asset])).values(),
  );

  const uniqueDescriptions = Array.from(
    new Map(
      allDescriptions.map((description) => [
        getDescriptionKey(description),
        description,
      ]),
    ).values(),
  );

  return {
    total_inventory_count: totalInventoryCount || uniqueAssets.length,
    assets: uniqueAssets,
    descriptions: uniqueDescriptions,
  };
}

function parseSteamJsonAssignment(html, variableName) {
  const index = html.indexOf(`${variableName} = `);

  if (index === -1) return null;

  const start = html.indexOf("{", index);

  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let stringQuote = "";
  let escaped = false;

  for (let i = start; i < html.length; i += 1) {
    const char = html[i];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        continue;
      }

      if (char === stringQuote) {
        inString = false;
        stringQuote = "";
      }

      continue;
    }

    if (char === '"' || char === "'") {
      inString = true;
      stringQuote = char;
      continue;
    }

    if (char === "{") depth += 1;

    if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        const jsonLike = html.slice(start, i + 1);

        try {
          return JSON.parse(jsonLike);
        } catch {
          try {
            return Function(`"use strict"; return (${jsonLike});`)();
          } catch (error) {
            console.warn(`Failed parsing ${variableName}:`, error.message);
            return null;
          }
        }
      }
    }
  }

  return null;
}

async function fetchSteamInventoryFromProfilePage(steamId64) {
  console.log("Using Steam profile inventory page fallback");

  const response = await fetchWithTimeout(
    `https://steamcommunity.com/profiles/${steamId64}/inventory/`,
    {
      headers: {
        "User-Agent": "Mozilla/5.0 SkinBrowser/1.0",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Cache-Control": "no-cache",
      },
    },
  );

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Profile inventory page failed: ${response.status} ${response.statusText} ${body.slice(
        0,
        200,
      )}`,
    );
  }

  const html = await response.text();

  const rgInventory = parseSteamJsonAssignment(html, "g_rgAssets");
  const rgDescriptions = parseSteamJsonAssignment(html, "g_rgDescriptions");

  const appAssets = rgInventory?.["730"]?.["2"] || {};
  const appDescriptions = rgDescriptions?.["730"] || {};

  const assets = Object.values(appAssets).map((asset) => ({
    assetid: asset.assetid || asset.id,
    classid: asset.classid,
    instanceid: asset.instanceid || "0",
    amount: asset.amount || 1,
  }));

  const descriptions = Object.values(appDescriptions)
    .flatMap((contextDescriptions) => {
      if (
        contextDescriptions &&
        typeof contextDescriptions === "object" &&
        !Array.isArray(contextDescriptions)
      ) {
        return Object.values(contextDescriptions);
      }

      return [];
    })
    .map((description) => ({
      ...description,
      instanceid: description.instanceid || "0",
      market_hash_name: description.market_hash_name || description.market_name,
      market_name: description.market_name || description.market_hash_name,
      icon_url: description.icon_url,
      tags: description.tags || [],
      tradable: Number(description.tradable || 0),
      marketable: Number(description.marketable || 0),
    }));

  console.log("Steam profile page inventory parsed:", {
    assetRows: assets.length,
    descriptionRows: descriptions.length,
    hasAssetsObject: Boolean(rgInventory),
    hasDescriptionsObject: Boolean(rgDescriptions),
  });

  return {
    total_inventory_count: assets.length,
    assets,
    descriptions,
  };
}

async function getMergedSteamInventoryData(steamId64) {
  let jsonData = null;
  let htmlData = null;

  try {
    jsonData = await fetchSteamInventoryModern(steamId64);
  } catch (error) {
    console.warn("Steam JSON inventory failed:", error.message);
  }

  try {
    htmlData = await fetchSteamInventoryFromProfilePage(steamId64);
  } catch (error) {
    console.warn("Steam profile page inventory failed:", error.message);
  }

  if (!jsonData && !htmlData) {
    throw new Error(
      "Unable to load Steam inventory. Make sure your Steam profile and inventory are public.",
    );
  }

  const mergedData = mergeInventoryData(jsonData, htmlData);

  console.log("Steam inventory source comparison:", {
    jsonAssets: jsonData?.assets?.length || 0,
    jsonDescriptions: jsonData?.descriptions?.length || 0,
    jsonTotal: jsonData?.total_inventory_count || 0,
    htmlAssets: htmlData?.assets?.length || 0,
    htmlDescriptions: htmlData?.descriptions?.length || 0,
    htmlTotal: htmlData?.total_inventory_count || 0,
    mergedAssets: mergedData.assets.length,
    mergedDescriptions: mergedData.descriptions.length,
    mergedTotal: mergedData.total_inventory_count,
  });

  return mergedData;
}

async function getSteamInventory(steamId64) {
  const data = await getMergedSteamInventoryData(steamId64);

  const assets = Array.isArray(data.assets) ? data.assets : [];
  const descriptions = Array.isArray(data.descriptions)
    ? data.descriptions
    : [];

  const descriptionMap = new Map();
  const classOnlyDescriptionMap = new Map();

  descriptions.forEach((description) => {
    descriptionMap.set(getDescriptionKey(description), description);

    if (!classOnlyDescriptionMap.has(getClassOnlyKey(description))) {
      classOnlyDescriptionMap.set(getClassOnlyKey(description), description);
    }
  });

  const items = assets.map((asset) => {
    const description = getDescriptionForAsset(
      asset,
      descriptionMap,
      classOnlyDescriptionMap,
    );

    return normalizeInventoryItem(asset, description, steamId64);
  });

  const totalQuantity = items.reduce((sum, item) => {
    return sum + Number(item.amount || 1);
  }, 0);

  console.log("Steam inventory loaded:", {
    steamId: steamId64,
    assetRows: assets.length,
    descriptionRows: descriptions.length,
    renderedRows: items.length,
    totalQuantity,
    steamTotal: data.total_inventory_count,
    inspectLinks: items.filter((item) => item.inspectLink).length,
    missingDescriptions: items.filter((item) =>
      item.name.startsWith("Unknown CS2 Item"),
    ).length,
  });

  return {
    total: Math.max(
      Number(data.total_inventory_count || 0),
      Number(totalQuantity || 0),
      items.length,
    ),
    rows: items.length,
    items,
  };
}

async function fetchFloatValue(inspectLink) {
  if (!inspectLink) return null;

  if (FLOAT_CACHE.has(inspectLink)) {
    return FLOAT_CACHE.get(inspectLink);
  }

  const encodedInspectLink = encodeURIComponent(inspectLink);
  const url = `https://api.csgofloat.com/?url=${encodedInspectLink}`;

  let data;

  try {
    const response = await fetchWithTimeout(
      url,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 SkinBrowser/1.0",
          Accept: "application/json",
        },
      },
      8000,
    );

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(
        `Fetch HTTP ${response.status} ${response.statusText} ${body.slice(
          0,
          250,
        )}`,
      );
    }

    data = await response.json();
  } catch (fetchError) {
    console.warn("Native fetch float lookup failed, trying HTTPS fallback:", {
      message: fetchError.message,
    });

    data = await httpsGetJson(url, 10000);
  }

  const value =
    Number(data?.iteminfo?.floatvalue) ||
    Number(data?.iteminfo?.float_value) ||
    Number(data?.floatvalue) ||
    Number(data?.float_value);

  const floatValue = Number.isFinite(value) && value >= 0 ? value : null;

  FLOAT_CACHE.set(inspectLink, floatValue);

  return floatValue;
}

async function runFloatLookupsWithConcurrency(items, concurrency = 12) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const currentIndex = index;
      index += 1;

      const item = items[currentIndex];

      try {
        const floatValue = await fetchFloatValue(item.inspectLink);

        results[currentIndex] = {
          assetId: item.assetId,
          floatValue,
          error: null,
        };
      } catch (error) {
        console.warn("Float lookup failed for asset:", {
          assetId: item.assetId,
          message: error.message,
        });

        results[currentIndex] = {
          assetId: item.assetId,
          floatValue: null,
          error: error.message || "Failed to load float.",
        };
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  );

  return results;
}

function parseSteamPrice(priceText) {
  if (!priceText) return null;

  const numeric = String(priceText).replace(/[^0-9.]/g, "");
  const value = Number(numeric);

  return Number.isFinite(value) ? value : null;
}

async function fetchSteamMarketPrice(marketHashName) {
  if (!marketHashName) return null;

  const cached = PRICE_CACHE.get(marketHashName);

  if (cached && Date.now() - cached.cachedAt < PRICE_CACHE_TTL_MS) {
    return cached.data;
  }

  const url = new URL("https://steamcommunity.com/market/priceoverview/");
  url.searchParams.set("appid", "730");
  url.searchParams.set("currency", "1");
  url.searchParams.set("market_hash_name", marketHashName);

  const response = await fetchWithTimeout(
    url.toString(),
    {
      headers: {
        "User-Agent": "Mozilla/5.0 SkinBrowser/1.0",
        Accept: "application/json",
      },
    },
    10000,
  );

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Steam price failed: ${response.status} ${response.statusText} ${body.slice(
        0,
        200,
      )}`,
    );
  }

  const data = await response.json();

  const priceData = {
    marketHashName,
    success: Boolean(data?.success),
    lowestPrice: data?.lowest_price || null,
    medianPrice: data?.median_price || null,
    volume: data?.volume || null,
    lowestPriceNumber: parseSteamPrice(data?.lowest_price),
    medianPriceNumber: parseSteamPrice(data?.median_price),
  };

  PRICE_CACHE.set(marketHashName, {
    cachedAt: Date.now(),
    data: priceData,
  });

  return priceData;
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/auth/steam", (_req, res) => {
  const returnUrl = `${BACKEND_URL}/auth/steam/return`;
  const authUrl = getSteamLoginUrl(returnUrl);

  res.redirect(authUrl);
});

app.get("/auth/steam/return", async (req, res, next) => {
  try {
    const returnUrl = `${BACKEND_URL}${req.originalUrl}`;
    const steamId = await steamSignIn.verifyLogin(returnUrl);
    const steamId64 = steamId.getSteamID64();

    const profile = await getSteamProfile(steamId64);

    req.session.user = profile;

    req.session.save((error) => {
      if (error) return next(error);

      return res.redirect(`${FRONTEND_URL}/inventory?auth=success`);
    });
  } catch (error) {
    next(error);
  }
});

app.get("/auth/me", (req, res) => {
  if (!req.session.user) {
    return res.json({
      isAuthenticated: false,
      user: null,
    });
  }

  return res.json({
    isAuthenticated: true,
    user: req.session.user,
  });
});

app.post("/auth/logout", (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);

    res.clearCookie("skinbrowser.sid");
    return res.json({ success: true });
  });
});

app.get("/steam/inventory/debug", requireAuth, async (req, res, next) => {
  try {
    const inventory = await getSteamInventory(req.session.user.steamId);
    const query = String(req.query.query || "").toLowerCase();

    const matches = inventory.items.filter((item) => {
      return [
        item.name,
        item.marketName,
        item.type,
        item.weapon,
        item.collection,
        item.exterior,
        item.rarity,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
    });

    return res.json({
      query,
      total: inventory.total,
      rows: inventory.rows,
      matchCount: matches.length,
      matches,
      firstTwentyNames: inventory.items.slice(0, 20).map((item) => item.name),
      allNames: inventory.items.map((item) => item.name),
    });
  } catch (error) {
    next(error);
  }
});

app.get("/steam/inventory", requireAuth, async (req, res, next) => {
  try {
    const inventory = await getSteamInventory(req.session.user.steamId);

    return res.json({
      steamId: req.session.user.steamId,
      total: inventory.total,
      rows: inventory.rows,
      items: inventory.items,
    });
  } catch (error) {
    next(error);
  }
});

app.post("/steam/prices", requireAuth, async (req, res, next) => {
  try {
    const requestedItems = Array.isArray(req.body?.items) ? req.body.items : [];

    const marketNames = Array.from(
      new Set(
        requestedItems
          .map((item) => String(item?.marketName || item?.name || "").trim())
          .filter(Boolean),
      ),
    ).slice(0, 120);

    const results = [];

    for (const marketName of marketNames) {
      try {
        const priceData = await fetchSteamMarketPrice(marketName);

        results.push({
          marketName,
          ...priceData,
          error: null,
        });
      } catch (error) {
        console.warn("Steam price lookup failed:", {
          marketName,
          message: error.message,
        });

        results.push({
          marketName,
          success: false,
          lowestPrice: null,
          medianPrice: null,
          volume: null,
          lowestPriceNumber: null,
          medianPriceNumber: null,
          error: error.message || "Failed to load price.",
        });
      }
    }

    return res.json({ results });
  } catch (error) {
    next(error);
  }
});

app.post("/steam/floats", requireAuth, async (req, res, next) => {
  try {
    const requestedItems = Array.isArray(req.body?.items) ? req.body.items : [];

    const safeItems = requestedItems
      .filter((item) => item?.assetId && item?.inspectLink)
      .slice(0, 120);

    const results = await runFloatLookupsWithConcurrency(safeItems, 12);

    return res.json({ results });
  } catch (error) {
    next(error);
  }
});

app.get("/steam/float/debug", requireAuth, async (req, res, next) => {
  try {
    const inspectLink = String(req.query.inspectLink || "");

    if (!inspectLink) {
      return res.status(400).json({ message: "Missing inspectLink query." });
    }

    const floatValue = await fetchFloatValue(inspectLink);

    return res.json({
      floatValue,
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error("Unhandled server error:", error);

  res.status(500).json({
    message: error.message || "Internal server error.",
    error: error.message || String(error),
  });
});

app.listen(PORT, () => {
  console.log(`Skin Browser auth server running on ${BACKEND_URL}`);
});
