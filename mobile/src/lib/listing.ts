// Helpers shared by every screen that shows a listing — a single-session
// experience or a multi-day trip. The API stores list fields (itinerary,
// included, tags) as JSON strings, and dates as the host typed them.

export type ListingKind = "experience" | "trip";

export interface ItineraryDay {
  title: string;
  description?: string | null;
}

export const isTrip = (l: { kind?: string } | null | undefined) => l?.kind === "trip";

export const needsApproval = (l: { joinPolicy?: string } | null | undefined) => l?.joinPolicy === "approval";

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
  const dmy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim());
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  const d = dmy
    ? new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]))
    : iso
      ? new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))
      : null;
  return d && !isNaN(d.getTime()) ? d : null;
}

/** Number of days a trip spans, counting both ends; null when dates can't be read. */
export function tripDays(l: { date?: string; endDate?: string | null }): number | null {
  const start = parseDate(l.date);
  const end = parseDate(l.endDate);
  if (!start || !end || end < start) return null;
  return Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
}

/** "12 Nov – 16 Nov" for trips, "12 Nov · 10:00" for experiences; falls back to the raw strings. */
export function whenLabel(l: { kind?: string; date?: string; endDate?: string | null; time?: string }): string {
  const fmt = (raw?: string | null) => {
    const d = parseDate(raw);
    return d ? d.toLocaleDateString(undefined, { day: "numeric", month: "short" }) : raw ?? "";
  };
  if (isTrip(l)) return l.endDate ? `${fmt(l.date)} – ${fmt(l.endDate)}` : fmt(l.date);
  return [fmt(l.date), l.time].filter(Boolean).join(" · ");
}

export const BOOKING_STATUS: Record<string, { label: string; tone: "green" | "amber" | "grey" | "red" }> = {
  requested: { label: "Awaiting host", tone: "amber" },
  pending:   { label: "Pending",       tone: "amber" },
  confirmed: { label: "✓ Confirmed",   tone: "green" },
  completed: { label: "Done",          tone: "grey" },
  cancelled: { label: "Cancelled",     tone: "red" },
  declined:  { label: "Not this time", tone: "grey" },
};

export const UPCOMING_STATUSES = ["requested", "pending", "confirmed"];

/** A route a host attached from their journey plan (see the web planner). */
export interface TripRoute {
  profile: string;
  stops: { name: string; lat: number; lng: number; day?: number | null }[];
  /** [lng, lat] pairs along the route. */
  coordinates: [number, number][];
  legs: { distanceMeters: number; durationSeconds: number }[];
  distanceMeters: number;
  durationSeconds: number;
  /** True when the server had no routing key and drew straight lines. */
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

// Same labels and formatting as web/lib/routing.ts.
const MODE_LABELS: Record<string, string> = {
  "driving-car": "Drive", "cycling-regular": "Cycle", "cycling-mountain": "Mountain bike",
  "foot-walking": "Walk", "foot-hiking": "Hike",
};
export const modeLabel = (profile: string) => MODE_LABELS[profile] ?? profile;

export function formatDistance(meters: number): string {
  if (!Number.isFinite(meters) || meters <= 0) return "0 km";
  if (meters < 1000) return `${Math.round(meters / 10) * 10} m`;
  const km = meters / 1000;
  return `${km < 100 ? km.toFixed(1).replace(/\.0$/, "") : Math.round(km).toLocaleString("en")} km`;
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0 min";
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h < 24) return m ? `${h} h ${m} min` : `${h} h`;
  const d = Math.floor(h / 24);
  const rh = h % 24;
  return rh ? `${d} d ${rh} h` : `${d} d`;
}

/** A region that fits every point, with a little padding. */
export function regionFor(points: { latitude: number; longitude: number }[]) {
  const lats = points.map((p) => p.latitude);
  const lngs = points.map((p) => p.longitude);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(0.02, (maxLat - minLat) * 1.4),
    longitudeDelta: Math.max(0.02, (maxLng - minLng) * 1.4),
  };
}
