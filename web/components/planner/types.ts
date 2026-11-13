import type { TravelMode } from "@/lib/routing";

export interface PlannerStop {
  /** Client-side id for keys and drag-and-drop. */
  uid: string;
  name: string;
  lat: number;
  lng: number;
  day: number;
  note?: string | null;
}

export interface RouteResult {
  profile: string;
  distanceMeters: number;
  durationSeconds: number;
  coordinates: [number, number][];
  legs: { distanceMeters: number; durationSeconds: number }[];
  estimated: boolean;
}

export interface PlaceResult {
  label: string;
  name: string;
  locality: string | null;
  country: string | null;
  lat: number;
  lng: number;
}

export interface SavedPlan {
  id: string;
  title: string;
  profile: TravelMode;
  startDate: string | null;
  stops: { name: string; lat: number; lng: number; day: number | null; note: string | null }[];
  route: RouteResult | null;
  distanceMeters: number;
  durationSeconds: number;
  updatedAt: string;
}

export interface HostedListing {
  listing: { id: string; title: string; kind: string; route: string | null };
  pendingRequests: number;
}

export const uid = () => Math.random().toString(36).slice(2, 10);
