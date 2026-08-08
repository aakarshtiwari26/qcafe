import { deleteImage } from "./client";

// scripts/seed.ts writes this placeholder for images that point at /public instead of
// ImageKit. Never attempt to delete it — it isn't a real ImageKit file id.
const NOT_AN_IMAGEKIT_FILE = new Set(["local-seed"]);

async function safeDelete(fileId: string) {
  if (NOT_AN_IMAGEKIT_FILE.has(fileId)) return;
  await deleteImage(fileId).catch((err) => {
    console.error("[imagekit] cleanup failed for", fileId, err);
  });
}

/** Deletes the old file when it's being replaced by a different one. Best-effort — never throws. */
export async function cleanupReplacedImage(
  oldFileId: string | undefined,
  newFileId: string | undefined
): Promise<void> {
  if (!oldFileId || oldFileId === newFileId) return;
  await safeDelete(oldFileId);
}

/** Deletes files that were removed from a list (e.g. a menu item's photo array), skipping any still kept. */
export async function cleanupRemovedImages(oldFileIds: string[], newFileIds: string[]): Promise<void> {
  const keep = new Set(newFileIds);
  const removed = oldFileIds.filter((id) => id && !keep.has(id));
  await Promise.all(removed.map(safeDelete));
}
