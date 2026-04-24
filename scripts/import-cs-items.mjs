import admin from "firebase-admin";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const SERVICE_ACCOUNT_PATH = path.resolve("./serviceAccountKey.json");

const serviceAccount = JSON.parse(
  await readFile(SERVICE_ACCOUNT_PATH, "utf-8"),
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const tradeupOutcomes = [
  {
    id: "sawed-off-kiss-love",
    name: "Kiss♥Love",
    weapon: "Sawed-Off",
    collection: "Dreams & Nightmares",
    rarity: "Classified",
    minFloat: 0.0,
    maxFloat: 0.8,
    image:
      "https://community.fastly.steamstatic.com/economy/image/class/730/5200288472/360fx360f",
    prices: {
      "Factory New": 2.76,
      "Minimal Wear": 1.48,
      "Field-Tested": 0.92,
      "Well-Worn": 0.71,
      "Battle-Scarred": 0.58,
    },
  },
  {
    id: "p250-visions",
    name: "Visions",
    weapon: "P250",
    collection: "Dreams & Nightmares",
    rarity: "Classified",
    minFloat: 0.0,
    maxFloat: 0.6,
    image:
      "https://community.fastly.steamstatic.com/economy/image/class/730/5200291881/360fx360f",
    prices: {
      "Factory New": 2.05,
      "Minimal Wear": 1.21,
      "Field-Tested": 0.83,
      "Well-Worn": 0.66,
      "Battle-Scarred": 0.54,
    },
  },
  {
    id: "ak47-ice-coaled",
    name: "Ice Coaled",
    weapon: "AK-47",
    collection: "Revolution Case",
    rarity: "Classified",
    minFloat: 0.0,
    maxFloat: 1.0,
    image:
      "https://community.fastly.steamstatic.com/economy/image/class/730/5304912838/360fx360f",
    prices: {
      "Factory New": 2.02,
      "Minimal Wear": 1.55,
      "Field-Tested": 1.08,
      "Well-Worn": 0.86,
      "Battle-Scarred": 0.74,
    },
  },
  {
    id: "glock18-vogue",
    name: "Vogue",
    weapon: "Glock-18",
    collection: "Revolution Case",
    rarity: "Classified",
    minFloat: 0.0,
    maxFloat: 0.7,
    image:
      "https://community.fastly.steamstatic.com/economy/image/class/730/5304916257/360fx360f",
    prices: {
      "Factory New": 1.5,
      "Minimal Wear": 1.1,
      "Field-Tested": 0.82,
      "Well-Worn": 0.69,
      "Battle-Scarred": 0.56,
    },
  },
  {
    id: "m4a4-tooth-fairy",
    name: "Tooth Fairy",
    weapon: "M4A4",
    collection: "Kilowatt Case",
    rarity: "Classified",
    minFloat: 0.0,
    maxFloat: 0.8,
    image:
      "https://community.fastly.steamstatic.com/economy/image/class/730/7217575348/360fx360f",
    prices: {
      "Factory New": 2.18,
      "Minimal Wear": 1.44,
      "Field-Tested": 1.01,
      "Well-Worn": 0.79,
      "Battle-Scarred": 0.63,
    },
  },
  {
    id: "xm1014-entombed",
    name: "Entombed",
    weapon: "XM1014",
    collection: "Kilowatt Case",
    rarity: "Classified",
    minFloat: 0.0,
    maxFloat: 0.5,
    image:
      "https://community.fastly.steamstatic.com/economy/image/class/730/7217585349/360fx360f",
    prices: {
      "Factory New": 2.25,
      "Minimal Wear": 1.67,
      "Field-Tested": 1.14,
      "Well-Worn": 0.88,
      "Battle-Scarred": 0.72,
    },
  },
];

async function main() {
  const batch = db.batch();

  for (const outcome of tradeupOutcomes) {
    const docRef = db.collection("tradeup_outcomes").doc(outcome.id);
    batch.set(
      docRef,
      {
        ...outcome,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  }

  await batch.commit();

  console.log(`Imported ${tradeupOutcomes.length} docs into tradeup_outcomes`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
