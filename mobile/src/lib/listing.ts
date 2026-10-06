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
