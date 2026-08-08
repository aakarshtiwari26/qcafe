/**
 * Step 2 of the public/images -> ImageKit migration.
 *
 * Reads the manifest produced by migrate-images-upload.ts and repoints every MenuItem
 * document that still has a seed-time local image (fileId "local-seed", url like
 * "/images/menu/Special-Veg-Thali.webp") at its uploaded ImageKit { url, fileId }.
 * Safe to re-run: only touches items that still have a "local-seed" fileId.
 *
 * Usage: npm run migrate:apply-images
 */
import fs from "fs";
import path from "path";
import { connectDB } from "../src/lib/db/connect";
import { MenuItem } from "../src/models";

const MANIFEST_PATH = path.join(__dirname, ".imagekit-migration-manifest.json");

interface ManifestEntry {
  url: string;
  fileId: string;
}

async function main() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`Manifest not found at ${MANIFEST_PATH}.`);
    console.error(`Run "npm run migrate:upload-images" first.`);
    process.exit(1);
  }
  const manifest: Record<string, ManifestEntry> = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));

  await connectDB();
  console.log("Connected. Applying migration...");

  const items = await MenuItem.find({ "images.fileId": "local-seed" });
  console.log(`Found ${items.length} menu item(s) with local-seed images.`);

  let updated = 0;
  const missing = new Set<string>();

  for (const item of items) {
    let changed = false;
    for (const image of item.images) {
      if (image.fileId !== "local-seed") continue;
      const localKey = image.url.replace(/^\/images\//, "");
      const entry = manifest[localKey];
      if (!entry) {
        missing.add(localKey);
        continue;
      }
      image.url = entry.url;
      image.fileId = entry.fileId;
      changed = true;
    }
    if (changed) {
      await item.save();
      updated++;
    }
  }

  console.log(`\nUpdated ${updated} menu item(s).`);
  if (missing.size > 0) {
    console.warn(`No manifest entry found for: ${[...missing].join(", ")}`);
  }
  console.log("Migration complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
