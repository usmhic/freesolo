/**
 * Travel modes and formatting shared by the planner and trip pages. Mode ids
 * are OpenRouteService profile names, which the API validates.
 */

export const TRAVEL_MODES = [
  { id: "driving-car", label: "Drive", short: "Car" },
  { id: "cycling-regular", label: "Cycle", short: "Bike" },
  { id: "cycling-mountain", label: "Mountain bike", short: "MTB" },
  { id: "foot-walking", label: "Walk", short: "Walk" },
  { id: "foot-hiking", label: "Hike", short: "Hike" },
] as const;

export type TravelMode = (typeof TRAVEL_MODES)[number]["id"];

export function modeLabel(id: string): string {
  return TRAVEL_MODES.find((m) => m.id === id)?.label ?? id;
}

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
