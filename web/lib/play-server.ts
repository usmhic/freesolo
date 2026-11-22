/** Server-side reads of the public game catalogue (for cached pages like the landing). */
import type { Lang } from "./i18n/config";
import type { CitySummary } from "./play";
import { publicGet } from "./public-api";

export async function getPlayCities(lang: Lang): Promise<CitySummary[]> {
  return (await publicGet<CitySummary[]>(`/api/play/cities?lang=${lang}`)) ?? [];
}
