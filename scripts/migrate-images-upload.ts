/**
 * Step 1 of the public/images -> ImageKit migration.
 *
 * Uploads every file under public/images to ImageKit with a clean, deterministic name
 * (useUniqueFileName: false), so re-running this script is safe — it overwrites the same
 * file instead of piling up duplicates. Writes scripts/.imagekit-migration-manifest.json
 * mapping the original local filename to its new ImageKit { url, fileId }.
 *
 * This step only talks to ImageKit, not the database. Run migrate-images-apply.ts next to
 * point existing MenuItem/RestaurantSettings documents at the uploaded URLs.
 *
 * Usage: npm run migrate:upload-images
 */
import fs from "fs";
import path from "path";
import { uploadImage } from "../src/lib/imagekit/client";

const PUBLIC_IMAGES_DIR = path.join(__dirname, "..", "public", "images");
const MANIFEST_PATH = path.join(__dirname, ".imagekit-migration-manifest.json");

interface ManifestEntry {
  url: string;
  fileId: string;
}

function cleanFileName(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  const base = path.basename(fileName, path.extname(fileName));
  const slug = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug}${ext}`;
}

async function uploadOne(localPath: string, folder: string): Promise<ManifestEntry> {
  const fileName = cleanFileName(path.basename(localPath));
  const buffer = fs.readFileSync(localPath);
  const uploaded = await uploadImage(buffer, fileName, folder, { useUniqueFileName: false });
  return uploaded;
}

async function main() {
  const manifest: Record<string, ManifestEntry> = {};

  const logoPath = path.join(PUBLIC_IMAGES_DIR, "logo.webp");
  if (fs.existsSync(logoPath)) {
    console.log("Uploading logo.webp -> restaurant/...");
    manifest["logo.webp"] = await uploadOne(logoPath, "restaurant");
  }

  const menuDir = path.join(PUBLIC_IMAGES_DIR, "menu");
  if (fs.existsSync(menuDir)) {
    const files = fs.readdirSync(menuDir).filter((f) => /\.(webp|png|jpe?g)$/i.test(f));
    for (const file of files) {
      console.log(`Uploading menu/${file} -> menu/...`);
      manifest[`menu/${file}`] = await uploadOne(path.join(menuDir, file), "menu");
    }
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`\nUploaded ${Object.keys(manifest).length} file(s).`);
  console.log(`Manifest written to ${MANIFEST_PATH}`);
  console.log("Next: npm run migrate:apply-images");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
