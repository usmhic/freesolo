/** Server-side reads of the public game catalogue (for cached pages like the landing). */
import type { Lang } from "./i18n/config";
import type { CitySummary } from "./play";

const API_URL = process.env.SPRING_BOOT_API_URL ?? "https://api.freesolo.osas.cloud";

export async function getPlayCities(lang: Lang): Promise<CitySummary[]> {
  try {
    const res = await fetch(`${API_URL}/api/play/cities?lang=${lang}`, { next: { revalidate: 60 } });
    return res.ok ? ((await res.json()) as CitySummary[]) : [];
  } catch {
    return [];
  }
}
