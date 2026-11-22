/**
 * The Spring Boot API's address on the server, and cached reads of its public
 * endpoints. No cookie is sent, so pages using these can be cached (ISR).
 * Reads fail soft: when the API is unreachable (a CI build, a local run
 * without the API) they return null and the page shows its empty state.
 */

export const API_URL = process.env.SPRING_BOOT_API_URL ?? "https://api.freesolo.osas.cloud";

/** How long a public read may be served from cache. */
export const PUBLIC_REVALIDATE_SECONDS = 60;

export async function publicGet<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate: PUBLIC_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(5000),
    });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}
