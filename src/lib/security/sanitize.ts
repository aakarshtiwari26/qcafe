import DOMPurify from "isomorphic-dompurify";

export function sanitizeText(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
}

export function sanitizeMongoInput<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map((item) => sanitizeMongoInput(item)) as unknown as T;
  }
  if (input !== null && typeof input === "object") {
    const clean: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      if (key.startsWith("$") || key.includes(".")) continue;
      clean[key] = sanitizeMongoInput(value);
    }
    return clean as T;
  }
  return input;
}
