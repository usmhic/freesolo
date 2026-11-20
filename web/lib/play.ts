/**
 * The city history game: API types, rank styling, and progress kept in the
 * browser for players who aren't signed in.
 */
import type { RouteResult } from "@/components/planner/types";

export interface Source { label: string; url: string }
export interface Photo { url: string; page: string; author: string; license: string }
export interface Fact { value: string; label: string }
export interface Rank { key: string; name: string; minStardust: number; nextAt: number | null; nextName: string | null }
export interface CitySummary {
  id: string; name: string; country: string; emoji: string; tagline: string; intro: string;
  colors: [string, string]; center: [number, number]; photo: Photo | null;
  lessons: number; freeLessons: number; points: number; unlocked: boolean; solved: number;
}
export interface LessonCard {
  id: string; title: string; place: string; lat: number; lng: number; era: string; minutes: number;
  points: number; free: boolean; locked: boolean; solved: boolean; hook: string; photo: Photo | null;
}
export interface CityView { city: CitySummary; lessons: LessonCard[] }
export interface LessonView { card: LessonCard; cityId: string; cityName: string; challenge: string; hints: string[]; aiJudge: boolean }
export interface PlayerView { stardust: number; rank: Rank; solvedLessonIds: string[]; unlockedCityIds: string[] }
export interface AttemptResult {
  correct: boolean; feedback: string; judgedBy: "ai" | "match"; story: string | null; sources: Source[] | null;
  facts: Fact[] | null;
  stardustEarned: number; alreadySolved: boolean; player: PlayerView | null;
}
export interface Standing {
  position: number; name: string; initial: string; stardust: number; solved: number; cities: number;
  rank: Rank; me: boolean;
}
export interface Leaderboard { period: "all" | "week"; players: number; top: Standing[]; me: Standing | null }

export interface JourneyView { city: CitySummary; startDate: string | null; days: { day: number; lessons: LessonCard[] }[]; route: RouteResult | null }

/** How each rank looks. Names and blurbs are in the dictionaries; thresholds come from the API. */
export const RANK_STYLE: Record<string, { orb: string; glow: string }> = {
  nebula: { orb: "radial-gradient(circle at 35% 35%, #F3C4FF, #9B6BFF 45%, #3B2A6B 80%)", glow: "#9B6BFF" },
  protostar: { orb: "radial-gradient(circle at 35% 35%, #FFF2C6, #FFB547 50%, #8A4A12 85%)", glow: "#FFB547" },
  "white-dwarf": { orb: "radial-gradient(circle at 35% 35%, #FFFFFF, #DCE8FF 55%, #8EA6D1 90%)", glow: "#DCE8FF" },
  "red-giant": { orb: "radial-gradient(circle at 35% 35%, #FFD0B8, #FF5A36 50%, #7A1E10 90%)", glow: "#FF5A36" },
  "blue-giant": { orb: "radial-gradient(circle at 35% 35%, #E0F4FF, #3FA9FF 50%, #123B7A 90%)", glow: "#3FA9FF" },
  supernova: { orb: "radial-gradient(circle at 50% 50%, #FFFFFF 5%, #FFD36B 25%, #FF6D1D 55%, #6B1A00 90%)", glow: "#FF6D1D" },
  "black-hole": { orb: "radial-gradient(circle at 50% 50%, #000 38%, #FF6D1D 46%, #FFB547 52%, #1B1030 70%)", glow: "#FF8A3D" },
};

// ── Guest progress (signed-out players) ──────────────────────────────────────

const GUEST_KEY = "freesolo.play.guest.v1";
const GUEST_EVENT = "freesolo:play-guest";

export interface GuestProgress { solved: Record<string, { stardust: number; cityId: string }> }

const EMPTY: GuestProgress = { solved: {} };
let cachedRaw: string | null = null;
let cached: GuestProgress = EMPTY;

export function readGuest(): GuestProgress {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    if (raw === cachedRaw) return cached;
    cachedRaw = raw;
    cached = raw ? { solved: { ...(JSON.parse(raw).solved ?? {}) } } : EMPTY;
    return cached;
  } catch {
    return EMPTY;
  }
}

export function recordGuestSolve(lessonId: string, cityId: string, stardust: number) {
  const current = readGuest();
  if (current.solved[lessonId]) return;
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify({ solved: { ...current.solved, [lessonId]: { stardust, cityId } } }));
    window.dispatchEvent(new Event(GUEST_EVENT));
  } catch {
    /* storage unavailable: progress lasts this page only */
  }
}

export function subscribeGuest(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(GUEST_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(GUEST_EVENT, onChange);
  };
}

export const serverGuest = () => EMPTY;

export function guestStardust(g: GuestProgress) {
  return Object.values(g.solved).reduce((sum, s) => sum + s.stardust, 0);
}

export function rankFor(stardust: number, ranks: Rank[]): Rank | null {
  let found: Rank | null = null;
  for (const r of ranks) if (stardust >= r.minStardust) found = r;
  return found;
}

/** 0–1 progress from the current rank to the next. */
export function rankProgress(stardust: number, rank: Rank | null) {
  if (!rank || rank.nextAt == null) return 1;
  return Math.min(1, Math.max(0, (stardust - rank.minStardust) / (rank.nextAt - rank.minStardust)));
}

/** Levels solved in a city, merging server state with this browser's guest progress. */
export function solvedIn(cityId: string, serverSolved: number, guest: GuestProgress) {
  const local = Object.values(guest.solved).filter((s) => s.cityId === cityId).length;
  return Math.max(serverSolved, local);
}

export const cityGradient = (c: Pick<CitySummary, "colors">) =>
  `linear-gradient(135deg, ${c.colors[0]} 0%, ${c.colors[0]} 35%, ${c.colors[1]} 130%)`;

/**
 * The right size of a place photo. Photos are served from /play/photos/ in
 * two widths: 960px (`name.webp`) and 330px (`name-330.webp`) for thumbnails.
 */
export function thumb(url: string, width: 330 | 500 | 960 | 1280): string {
  if (url.startsWith("/play/photos/")) return width <= 500 ? url.replace(/\.webp$/, "-330.webp") : url;
  // Wikimedia thumbnails come in standard widths only.
  return url.replace(/\/(\d+)px-/, `/${width <= 330 ? 330 : width <= 500 ? 500 : width <= 960 ? 960 : 1280}px-`);
}

/** Videos about a place, as a YouTube search — always current, never a dead link. */
export const videoSearch = (place: string, city: string, historyWord: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(`${place} ${city} ${historyWord}`)}`;
