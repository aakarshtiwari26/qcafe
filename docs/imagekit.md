# Image management (ImageKit)

Every image in the app — menu photos, category thumbnails, the restaurant logo/banner,
user avatars — is stored in [ImageKit](https://imagekit.io), never in MongoDB and never in
`public/`. MongoDB only ever holds a small reference: `{ url, fileId }`.

## Folder structure

Uploads are organized under a single root folder named after `APP_NAME` (from `.env.local`),
so `/qcafe/...` in this project:

```
/qcafe
  /menu         menu item photos            (admin-only)
  /category     category thumbnails         (admin-only)
  /restaurant   logo, banner                (admin-only)
  /avatar       user profile pictures       (any signed-in user, own account only)
```

The folder is decided by the `folder` argument passed to `uploadImage()` — see
`src/lib/imagekit/client.ts`. `POST /api/upload` (`src/app/api/upload/route.ts`) enforces which
folders exist and which ones require an admin session (`ADMIN_ONLY_FOLDERS` in that file).

## How a URL ends up in the database

Every model that has an image stores the same shape:

```ts
image?: { url: string; fileId: string }        // Category, RestaurantSettings (logo/banner), User (profileImage)
images: { url: string; fileId: string; isPrimary: boolean }[]   // MenuItem (multiple photos)
```

The `fileId` is what makes cleanup possible later — it's ImageKit's own file identifier, not
derived from the URL.

## Upload flow (new product / category / avatar / logo)

1. The admin picks a file in the `<ImageUpload>` component (`src/components/shared/image-upload.tsx`).
2. It's sent as `multipart/form-data` to `POST /api/upload` with a `folder` field.
3. The route validates the file (`src/lib/security/file-validation.ts`: type/size/magic-byte
   checks), rate-limits by IP, checks the folder's auth requirement, then calls
   `uploadImage()` in `src/lib/imagekit/client.ts`, which uploads to ImageKit with
   `useUniqueFileName: true` (so two admins can never collide on the same filename).
4. The route returns `{ url, fileId }`. The form holds this in local state and only
   persists it to MongoDB when the surrounding form (menu item, category, settings, profile)
   is actually saved.

This is the same path for creating a new menu item, adding a category, changing the
restaurant logo/banner, or updating a profile picture — one component, one API route, one
upload function. Nothing folder-specific is duplicated per feature.

## Edit / replace flow — and cleanup

When an image is replaced or removed, the **old ImageKit file is deleted**, not left behind.
This is handled server-side in the service layer (`src/services/*.service.ts`), not in the
browser — so it happens reliably even if the admin's tab closes right after saving.

- `src/lib/imagekit/cleanup.ts` has the two reusable helpers:
  - `cleanupReplacedImage(oldFileId, newFileId)` — deletes the old file if it was swapped
    for a different one. Used by `category.service.ts` (category image),
    `settings.service.ts` (logo/banner), and `profile.service.ts` (avatar).
  - `cleanupRemovedImages(oldFileIds, newFileIds)` — deletes whichever files were dropped
    from a list.
- Menu items are the one special case: **Duplicate** (`menu-item-row-actions.tsx` →
  `duplicateMenuItem`) copies a menu item's photos by reference (same `fileId`, two
  documents). `menu.service.ts` has its own `deleteMenuImagesIfUnreferenced()` that checks
  no *other* menu item still points at a file before actually deleting it from ImageKit —
  so deleting a duplicate never breaks the original's photos, or vice versa.
- Deleting a category or a menu item deletes its image(s) from ImageKit too (with the same
  shared-reference check for menu items).

All deletes are best-effort and logged (`console.error("[imagekit] cleanup failed"...)`) —
a failed cleanup never blocks or fails the save/delete the admin is trying to do.

## Migrating the original `public/images` assets

Early menu items were seeded (`scripts/seed.ts`) with local paths like
`/images/menu/Special-Veg-Thali.webp` and a placeholder `fileId: "local-seed"` — i.e. they
were never real ImageKit files. Two scripts move them over, in two steps so a MongoDB outage
can't leave ImageKit half-uploaded and the DB half-updated:

```bash
npm run migrate:upload-images   # uploads public/images/** to ImageKit, writes a manifest
npm run migrate:apply-images    # reads the manifest, repoints MenuItem docs at the new URLs
```

- `migrate-images-upload.ts` only talks to ImageKit. It uploads with a clean, deterministic,
  lowercase filename and `useUniqueFileName: false`, so re-running it **overwrites** rather
  than duplicating. It writes `scripts/.imagekit-migration-manifest.json` (gitignored —
  it's a local artifact, not something to commit).
- `migrate-images-apply.ts` only talks to MongoDB. It finds every `MenuItem` whose image
  still has `fileId: "local-seed"`, looks up the matching entry in the manifest, and updates
  `url`/`fileId` in place. Safe to re-run — it only ever touches items still on the old
  placeholder.

**Once `migrate:apply-images` has been run successfully and you've confirmed menu photos
load correctly from `ik.imagekit.io` in the browser, `public/images/menu/*` and
`public/images/logo.webp` are no longer referenced anywhere and can be deleted.** Don't
delete them before that — any menu item that hasn't been migrated yet still points at the
local path.

## Where images are referenced outside the upload flow

- `src/config/site.ts` — the site-wide `logoUrl` shown in the navbar/footer/manifest is a
  fixed ImageKit URL derived from `IMAGEKIT_URL_ENDPOINT` + the app-name folder, not a DB
  read (it needs to be available in places like `manifest.ts` that don't hit the database).
- `src/components/home/hero.tsx` — the hero section's featured dish photo is a direct
  ImageKit URL (decorative content, not tied to a specific menu item).
- Everything else (menu item photos, category thumbnails, avatars, logo/banner *as managed
  from Admin → Settings*) is read from MongoDB via the models above.
