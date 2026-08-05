import { AppError } from "@/lib/api/errors";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

// Magic-byte signatures — the client-sent MIME type is untrusted; the
// first bytes of the actual payload are what we verify against.
const SIGNATURES: Array<{ mime: string; bytes: number[] }> = [
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46] }, // "RIFF" (WebP container)
];

function matchesKnownImageSignature(buffer: Buffer): boolean {
  return SIGNATURES.some((sig) => sig.bytes.every((byte, i) => buffer[i] === byte));
}

export function validateImageFile(file: File, buffer: Buffer): void {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new AppError(
      `Unsupported file type: ${file.type}. Allowed: JPEG, PNG, WebP.`,
      415,
      "UNSUPPORTED_FILE_TYPE"
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new AppError("File is too large. Maximum size is 5MB.", 413, "FILE_TOO_LARGE");
  }

  if (!matchesKnownImageSignature(buffer)) {
    throw new AppError("File content does not match a valid image format.", 415, "INVALID_FILE_CONTENT");
  }
}
