import admin from "firebase-admin";
import { readFile } from "node:fs/promises";
import path from "node:path";

const serviceAccount = JSON.parse(
  await readFile(path.resolve("./serviceAccountKey.json"), "utf-8"),
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function main() {
  const snapshot = await db
    .collection("skins")
    .where("weapon", "==", "Bayonet")
    .where("skinName", "==", "Gamma Doppler")
    .get();

  snapshot.forEach((doc) => {
    console.log("DOC ID:", doc.id);
    console.log(doc.data());
    console.log("--------------");
  });
}

main();
