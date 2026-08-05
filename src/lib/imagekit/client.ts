import ImageKit, { toFile } from "@imagekit/nodejs";
import { env } from "@/config/env";
import { AppError } from "@/lib/api/errors";

export const imagekit = new ImageKit({ privateKey: env.IMAGEKIT_PRIVATE_KEY });

export interface UploadedImage {
  url: string;
  fileId: string;
}

export async function uploadImage(
  buffer: Buffer,
  fileName: string,
  folder: string
): Promise<UploadedImage> {
  const file = await toFile(buffer, fileName);
  const result = await imagekit.files.upload({
    file,
    fileName,
    folder: `/${env.APP_NAME.toLowerCase().replace(/\s+/g, "-")}/${folder}`,
    useUniqueFileName: true,
  });

  if (!result.url || !result.fileId) {
    throw new AppError("Image upload did not return a valid file", 502, "UPLOAD_FAILED");
  }

  return { url: result.url, fileId: result.fileId };
}

export async function deleteImage(fileId: string): Promise<void> {
  await imagekit.files.delete(fileId);
}

export async function replaceImage(
  oldFileId: string | undefined,
  file: Buffer,
  fileName: string,
  folder: string
): Promise<UploadedImage> {
  const uploaded = await uploadImage(file, fileName, folder);
  if (oldFileId) {
    await deleteImage(oldFileId).catch((err) => {
      console.error("[imagekit] failed to delete old file", oldFileId, err);
    });
  }
  return uploaded;
}
