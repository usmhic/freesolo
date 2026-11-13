/**
 * Browser-side calls to the API through the web app's /api/** proxy. The
 * session cookie rides along automatically; errors come back as the API's
 * human-readable message.
 */
export class ClientApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
      credentials: "same-origin",
    });
  } catch {
    throw new ClientApiError(0, "You seem to be offline — check your connection.");
  }
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      (body && (body.message || (body.fieldErrors && Object.values(body.fieldErrors)[0]))) ||
      "Something went wrong. Try again.";
    throw new ClientApiError(res.status, String(message));
  }
  return body as T;
}
