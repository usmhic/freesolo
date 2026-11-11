/**
 * Public listing data for the marketing site — trips and experiences as the
 * Spring Boot API serves them on its unauthenticated read endpoints.
 *
 * These calls carry no cookie, so pages that use them can be cached (ISR)
 * instead of rendering per request. Every call fails soft: when the API is
 * unreachable (a CI build, a local run without the API) the page renders its
 * empty state rather than erroring.
 */

const API_URL = process.env.SPRING_BOOT_API_URL ?? "https://api.freesolo.osas.cloud";

export type ListingKind = "trip" | "experience";

export interface ItineraryDay {
  title: string;
  description?: string | null;
}

export interface Listing {
  id: string;
  kind: ListingKind;
  host: { id: string; name: string | null; image: string | null };
  business: { id: string; name: string; address: string; city: string } | null;
  title: string;
  description: string;
  category: string;
  emoji: string | null;
  city: string;
  country: string | null;
  date: string;
  time: string;
  endDate: string | null;
  durationMins: number;
  minSeats: number;
  maxSeats: number;
  price: number;
  currency: string | null;
  coverImage: string | null;
  itinerary: string;
  included: string;
  joinPolicy: "instant" | "approval";
  /** JSON {@link TripRoute} copied from the host's plan, or null. */
  route: string | null;
  status: string;
  featured: boolean;
  filledSeats: number;
  availableSeats: number;
}

/** How long a public listing page may be served from cache. */
export const LISTINGS_REVALIDATE_SECONDS = 60;

async function publicGet<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate: LISTINGS_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export interface TripRoute {
  profile: string;
  stops: { name: string; lat: number; lng: number; day?: number | null }[];
  /** [lng, lat] pairs along the route. */
  coordinates: [number, number][];
  legs: { distanceMeters: number; durationSeconds: number }[];
  distanceMeters: number;
  durationSeconds: number;
  estimated: boolean;
}

export function parseRoute(json: string | null | undefined): TripRoute | null {
  if (!json) return null;
  try {
    const r = JSON.parse(json) as TripRoute;
    return Array.isArray(r?.coordinates) && Array.isArray(r?.stops) && r.stops.length >= 2 ? r : null;
  } catch {
    return null;
  }
}

export async function getListings(opts: { kind?: ListingKind; limit?: number; city?: string } = {}): Promise<Listing[]> {
  const params = new URLSearchParams({ limit: String(opts.limit ?? 24) });
  if (opts.kind) params.set("kind", opts.kind);
  if (opts.city) params.set("city", opts.city);
  const page = await publicGet<{ data: Listing[] }>(`/api/experiences?${params}`);
  return page?.data ?? [];
}

export async function getListing(id: string): Promise<Listing | null> {
  return publicGet<Listing>(`/api/experiences/${encodeURIComponent(id)}`);
}

export function parseList<T = string>(json: string | null | undefined): T[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Accepts the two formats hosts use: DD/MM/YYYY (mobile form) and YYYY-MM-DD. */
export function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const v = value.trim();
  const dmy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(v);
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(v);
  const d = dmy
    ? new Date(Date.UTC(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1])))
    : iso
      ? new Date(Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])))
      : null;
  return d && !isNaN(d.getTime()) ? d : null;
}

const dayMonth = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

/** Days a trip spans, counting both ends; null when the dates can't be read. */
export function tripDays(l: Pick<Listing, "date" | "endDate">): number | null {
  const start = parseDate(l.date);
  const end = parseDate(l.endDate);
  if (!start || !end || end < start) return null;
  return Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
}

/** "10 – 14 Nov" / "28 Nov – 2 Dec" for trips; "1 Nov · 10:00" for experiences. */
export function whenLabel(l: Pick<Listing, "kind" | "date" | "endDate" | "time">): string {
  const start = parseDate(l.date);
  if (!start) return [l.date, l.time].filter(Boolean).join(" · ");
  if (l.kind !== "trip") return `${dayMonth(start)} · ${l.time}`;
  const end = parseDate(l.endDate);
  if (!end) return dayMonth(start);
  const sameMonth = start.getUTCMonth() === end.getUTCMonth() && start.getUTCFullYear() === end.getUTCFullYear();
  return sameMonth ? `${start.getUTCDate()} – ${dayMonth(end)}` : `${dayMonth(start)} – ${dayMonth(end)}`;
}

export function money(amount: number, currency: string | null | undefined): string {
  try {
    return new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: currency || "EUR",
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency ?? ""}`.trim();
  }
}

/** A warm two-stop gradient picked from the listing id, so covers without a photo still differ. */
const COVERS = [
  ["#233846", "#2F6F8F"],
  ["#233846", "#FF6D1D"],
  ["#1F3A33", "#3F7A5A"],
  ["#3A2418", "#F08A4B"],
  ["#1E2D44", "#5B7FBF"],
  ["#2B2F3A", "#C98B5A"],
] as const;

export function coverGradient(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const [from, to] = COVERS[h % COVERS.length];
  return `linear-gradient(135deg, ${from} 0%, ${to} 100%)`;
}
