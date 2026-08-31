import { init, id } from "@instantdb/admin";
import schema from "../src/instant.schema";
import { INITIAL_CURATED_FACES } from "../src/lib/curatedFaces";

const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID || "9c207467-cf34-4ed9-a1a5-077ec58ba276";
const ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN;

async function seed() {
  console.log("Seeding Best Face database...");
  const adminDb = init({
    appId: APP_ID,
    adminToken: ADMIN_TOKEN || "anon",
    schema,
  });

  const txs = INITIAL_CURATED_FACES.map((face) => {
    return adminDb.tx.faces[face.id].update({
      name: face.name,
      gender: face.gender,
      imageUrl: face.imageUrl,
      rating: face.rating,
      comparisonsCount: face.comparisonsCount,
      wins: face.wins,
      losses: face.losses,
      age: face.age,
      bio: face.bio,
      city: face.city,
      occupation: face.occupation,
      createdAt: face.createdAt,
    });
  });

  try {
    await adminDb.transact(txs);
    console.log("✅ Seeded", txs.length, "faces successfully!");
  } catch (err) {
    console.log("Notice: Seed skipped or offline mode active.", (err as Error).message);
  }
}

seed();
