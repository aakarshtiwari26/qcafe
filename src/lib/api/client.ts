export class ApiClientError extends Error {
  constructor(
    message: string,
    public code?: string,
    public issues?: Record<string, string[]>
  ) {
    super(message);
  }
}

/** Thin fetch wrapper matching the {data} / {error} envelope every API route returns. */
export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiClientError(
      body?.error?.message ?? "Something went wrong",
      body?.error?.code,
      body?.error?.issues
    );
  }

  return body.data as T;
}

/** Multipart upload — never set a Content-Type header, the browser sets the boundary. */
export async function apiUpload<T>(url: string, formData: FormData): Promise<T> {
  const res = await fetch(url, { method: "POST", body: formData });
  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiClientError(body?.error?.message ?? "Upload failed", body?.error?.code);
  }

  return body.data as T;
}
