"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Bike,
  Car,
  Check,
  ChevronDown,
  Cloud,
  FilePlus2,
  Footprints,
  FolderOpen,
  Loader2,
  MapPinned,
  Mountain,
  Route as RouteIcon,
  Save,
  Sparkles,
  Trash2,
  Waypoints,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { api, ClientApiError } from "@/lib/client-api";
import { formatDistance, formatDuration, TRAVEL_MODES, type TravelMode } from "@/lib/routing";
import { RouteMap } from "@/components/map/route-map";
import { PlaceSearch } from "./place-search";
import { sortByDay, StopList } from "./stop-list";
import { uid, type HostedListing, type PlaceResult, type PlannerStop, type RouteResult, type SavedPlan } from "./types";

const DRAFT_KEY = "freesolo.planner.draft";
const MAX_STOPS = 25;
const MODE_ICONS: Record<TravelMode, typeof Car> = {
  "driving-car": Car,
  "cycling-regular": Bike,
  "cycling-mountain": Mountain,
  "foot-walking": Footprints,
  "foot-hiking": Mountain,
};

const SAMPLE: Omit<PlannerStop, "uid">[] = [
  { name: "Porto", lat: 41.1496, lng: -8.6109, day: 1 },
  { name: "Peso da Régua", lat: 41.163, lng: -7.788, day: 1 },
  { name: "Pinhão", lat: 41.1906, lng: -7.5465, day: 2 },
  { name: "Vila Real", lat: 41.3006, lng: -7.7441, day: 2 },
];

interface Draft {
  id: string | null;
  title: string;
  profile: TravelMode;
  days: number;
  stops: PlannerStop[];
}

const EMPTY: Draft = { id: null, title: "Untitled trip", profile: "driving-car", days: 1, stops: [] };

function fromSaved(p: SavedPlan): Draft {
  const stops = p.stops.map((s) => ({ uid: uid(), name: s.name, lat: s.lat, lng: s.lng, day: s.day ?? 1, note: s.note }));
  return {
    id: p.id,
    title: p.title,
    profile: p.profile,
    days: Math.max(1, ...stops.map((s) => s.day)),
    stops,
  };
}

export function Planner({ signedIn, initialPlanId }: { signedIn: boolean; initialPlanId: string | null }) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [routing, setRouting] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [activeUid, setActiveUid] = useState<string | null>(null);
  const [plans, setPlans] = useState<SavedPlan[] | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [listings, setListings] = useState<HostedListing[] | null>(null);
  const [attachTo, setAttachTo] = useState("");
  const [attaching, setAttaching] = useState(false);
  const [view, setView] = useState<"list" | "map">("list");
  const routeReq = useRef(0);

  const change = useCallback((patch: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setDirty(true);
  }, []);

  // ── Load: a saved plan from the URL, else this device's draft ─────────────
  useEffect(() => {
    (async () => {
      if (signedIn && initialPlanId) {
        try {
          const p = await api<SavedPlan>(`/api/plans/${encodeURIComponent(initialPlanId)}`);
          setDraft(fromSaved(p));
          setRoute(p.route);
          setHydrated(true);
          return;
        } catch {
          setNotice("That plan couldn't be opened — it may have been deleted.");
        }
      }
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (raw) {
          const d = JSON.parse(raw) as Draft;
          if (Array.isArray(d.stops)) setDraft({ ...EMPTY, ...d, id: signedIn ? d.id : null });
        }
      } catch {
        // storage unavailable or corrupt: start empty
      }
      setHydrated(true);
    })();
  }, [signedIn, initialPlanId]);

  // Keep a local draft so nothing is lost on refresh, signed in or not.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // private mode / storage full: the plan still works for this visit
    }
  }, [draft, hydrated]);

  // ── Routing: recompute whenever the stops or the mode change ──────────────
  const routeKey = useMemo(
    () => draft.profile + "|" + draft.stops.map((s) => `${s.lng.toFixed(5)},${s.lat.toFixed(5)}`).join(";"),
    [draft.profile, draft.stops]
  );
  useEffect(() => {
    if (!hydrated || draft.stops.length < 2) return;
    const id = ++routeReq.current;
    const t = setTimeout(async () => {
      setRouting(true);
      try {
        const r = await api<RouteResult>("/api/routing/directions", {
          method: "POST",
          body: JSON.stringify({ profile: draft.profile, coordinates: draft.stops.map((s) => [s.lng, s.lat]) }),
        });
        if (id !== routeReq.current) return;
        setRoute(r);
        setRouteError(null);
      } catch (e) {
        if (id !== routeReq.current) return;
        setRoute(null);
        setRouteError(e instanceof Error ? e.message : "Couldn't work out a route");
      } finally {
        if (id === routeReq.current) setRouting(false);
      }
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey, hydrated]);

  // ── Signed-in extras: saved plans and hosted trips ────────────────────────
  const loadPlans = useCallback(async () => {
    if (!signedIn) return;
    try {
      setPlans(await api<SavedPlan[]>("/api/plans"));
    } catch {
      setPlans([]);
    }
  }, [signedIn]);
  useEffect(() => {
    if (!signedIn) return;
    let live = true;
    api<SavedPlan[]>("/api/plans")
      .then((p) => live && setPlans(p))
      .catch(() => live && setPlans([]));
    api<HostedListing[]>("/api/hosting/listings")
      .then((l) => live && setListings(l.filter((x) => x.listing.kind === "trip")))
      .catch(() => live && setListings([]));
    return () => {
      live = false;
    };
  }, [signedIn]);

  // ── Stop editing ──────────────────────────────────────────────────────────
  function addStop(name: string, lat: number, lng: number) {
    if (draft.stops.length >= MAX_STOPS) {
      setNotice(`A plan can have up to ${MAX_STOPS} stops.`);
      return;
    }
    const s: PlannerStop = { uid: uid(), name, lat, lng, day: draft.days };
    change({ stops: sortByDay([...draft.stops, s]) });
    setActiveUid(s.uid);
  }

  const pickPlace = (p: PlaceResult) => addStop(p.name, p.lat, p.lng);
  const clickMap = (lat: number, lng: number) =>
    addStop(`Stop ${draft.stops.length + 1} (${lat.toFixed(3)}, ${lng.toFixed(3)})`, lat, lng);

  function newPlan() {
    setDraft(EMPTY);
    setRoute(null);
    setRouteError(null);
    setDirty(false);
    setSavedAt(null);
    setMenuOpen(false);
    window.history.replaceState(null, "", "/planner");
  }

  function loadSample() {
    change({
      title: "Douro valley by car",
      profile: "driving-car",
      days: 2,
      stops: SAMPLE.map((s) => ({ ...s, uid: uid() })),
    });
  }

  // ── Save / open / delete ──────────────────────────────────────────────────
  async function save() {
    if (!signedIn) return;
    setSaving(true);
    setNotice(null);
    try {
      const body = JSON.stringify({
        title: draft.title.trim() || "Untitled trip",
        profile: draft.profile,
        stops: draft.stops.map((s) => ({ name: s.name.trim() || "Stop", lat: s.lat, lng: s.lng, day: s.day, note: s.note ?? null })),
      });
      const saved = draft.id
        ? await api<SavedPlan>(`/api/plans/${draft.id}`, { method: "PUT", body })
        : await api<SavedPlan>("/api/plans", { method: "POST", body });
      setDraft((d) => ({ ...d, id: saved.id }));
      if (saved.route) setRoute(saved.route);
      setDirty(false);
      setSavedAt(Date.now());
      window.history.replaceState(null, "", `/planner?plan=${saved.id}`);
      loadPlans();
    } catch (e) {
      setNotice(e instanceof ClientApiError ? e.message : "Couldn't save the plan.");
    } finally {
      setSaving(false);
    }
  }

  function open(p: SavedPlan) {
    setDraft(fromSaved(p));
    setRoute(p.route);
    setDirty(false);
    setSavedAt(null);
    setMenuOpen(false);
    window.history.replaceState(null, "", `/planner?plan=${p.id}`);
  }

  async function remove(p: SavedPlan) {
    if (!window.confirm(`Delete “${p.title}”? This can't be undone.`)) return;
    try {
      await api(`/api/plans/${p.id}`, { method: "DELETE" });
      if (draft.id === p.id) newPlan();
      loadPlans();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Couldn't delete the plan.");
    }
  }

  async function attach() {
    if (!draft.id || !attachTo) return;
    setAttaching(true);
    setNotice(null);
    try {
      await api(`/api/hosting/listings/${attachTo}/route`, { method: "PUT", body: JSON.stringify({ planId: draft.id }) });
      const title = listings?.find((l) => l.listing.id === attachTo)?.listing.title;
      setNotice(`Route added to “${title}”. Travelers will see it on the trip page.`);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Couldn't add the route to that trip.");
    } finally {
      setAttaching(false);
    }
  }

  // With fewer than two stops there's no route, whatever the last request said.
  const shownRoute = draft.stops.length >= 2 ? route : null;
  const shownError = draft.stops.length >= 2 ? routeError : null;

  const focus = draft.stops.length
    ? { lat: draft.stops[draft.stops.length - 1].lat, lng: draft.stops[draft.stops.length - 1].lng }
    : null;
  const activeIndex = draft.stops.findIndex((s) => s.uid === activeUid);

  // ── Layout ────────────────────────────────────────────────────────────────
  return (
    // Desktop: exactly the viewport under the header (flex-none so the height
    // isn't overridden by flex growth); the panel scrolls inside it.
    <div className="relative flex min-h-0 flex-1 flex-col lg:h-[calc(100dvh-4rem)] lg:flex-none lg:flex-row">
      {/* Phone: switch between the list and a full map */}
      <div className="sticky top-16 z-30 flex gap-1 border-b border-line bg-paper/95 p-2 backdrop-blur lg:hidden">
        {(["list", "map"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            aria-pressed={view === v}
            className={cn("flex-1 rounded-full py-2 text-sm font-semibold", view === v ? "bg-navy text-white dark:bg-ink dark:text-navy-deep" : "text-ink-soft")}
          >
            {v === "list" ? "Plan" : "Map"}
          </button>
        ))}
      </div>

      {/* ── Panel ──────────────────────────────────────────────────────── */}
      <aside
        className={cn(
          "flex min-h-0 w-full flex-col border-line bg-paper lg:w-[420px] lg:shrink-0 lg:border-r",
          view === "map" && "hidden lg:flex"
        )}
      >
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 pb-40 sm:p-5 lg:pb-5">
          {/* Title + plan menu */}
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <p className="eyebrow">Trip planner</p>
              <input
                value={draft.title}
                onChange={(e) => change({ title: e.target.value.slice(0, 120) })}
                aria-label="Plan title"
                className="mt-1 w-full rounded-lg bg-transparent font-display text-2xl font-extrabold tracking-tight text-ink outline-none focus:bg-fd-muted"
              />
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => { setMenuOpen((o) => !o); if (!plans) loadPlans(); }}
                aria-expanded={menuOpen}
                className="btn-outline btn-sm mt-5"
              >
                <FolderOpen className="size-4" /> Plans <ChevronDown className="size-3.5" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full z-[1001] mt-2 w-72 overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
                  <button type="button" onClick={newPlan} className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold hover:bg-fd-muted">
                    <FilePlus2 className="size-4 text-sunset" /> New plan
                  </button>
                  <div className="max-h-72 overflow-y-auto border-t border-line">
                    {!signedIn ? (
                      <p className="px-4 py-4 text-sm text-ink-soft">
                        <Link href="/sign-in?next=/planner" className="font-semibold text-sunset hover:underline">Sign in</Link> to
                        save plans and open them anywhere.
                      </p>
                    ) : plans === null ? (
                      <p className="flex items-center gap-2 px-4 py-4 text-sm text-ink-soft"><Loader2 className="size-4 animate-spin" /> Loading…</p>
                    ) : plans.length === 0 ? (
                      <p className="px-4 py-4 text-sm text-ink-soft">No saved plans yet.</p>
                    ) : (
                      plans.map((p) => (
                        <div key={p.id} className={cn("group flex items-center gap-2 px-4 py-2.5 hover:bg-fd-muted", p.id === draft.id && "bg-sunset-soft")}>
                          <button type="button" onClick={() => open(p)} className="min-w-0 flex-1 text-left">
                            <span className="block truncate text-sm font-semibold text-ink">{p.title}</span>
                            <span className="block text-xs text-ink-soft">
                              {p.stops.length} stops{p.distanceMeters ? ` · ${formatDistance(p.distanceMeters)}` : ""}
                            </span>
                          </button>
                          <button type="button" onClick={() => remove(p)} aria-label={`Delete ${p.title}`} className="rounded-lg p-1.5 text-ink-soft hover:text-red-600">
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mode */}
          <div role="radiogroup" aria-label="Travel mode" className="grid grid-cols-5 gap-1 rounded-2xl border border-line bg-surface p-1">
            {TRAVEL_MODES.map((m) => {
              const Icon = MODE_ICONS[m.id];
              const on = draft.profile === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  title={m.label}
                  onClick={() => change({ profile: m.id })}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-xl py-2 text-[11px] font-semibold transition",
                    on ? "bg-sunset text-white shadow-sm" : "text-ink-soft hover:bg-fd-muted hover:text-ink"
                  )}
                >
                  <Icon className="size-4" />
                  {m.short}
                </button>
              );
            })}
          </div>

          <PlaceSearch focus={focus} onPick={pickPlace} />

          {notice && (
            <p role="status" className="rounded-2xl bg-sunset-soft px-4 py-3 text-sm text-ink">
              {notice}
            </p>
          )}

          {hydrated && draft.stops.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-line px-5 py-8 text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-sunset-soft text-sunset">
                <MapPinned className="size-5" />
              </span>
              <p className="mt-4 font-display text-lg font-bold">Start with your first stop</p>
              <p className="mt-1 text-sm text-ink-soft">Search for a place above, or click anywhere on the map.</p>
              <button type="button" onClick={loadSample} className="btn-outline btn-sm mt-5">
                <Sparkles className="size-4" /> Try a sample route
              </button>
            </div>
          ) : (
            <StopList
              stops={draft.stops}
              days={draft.days}
              route={shownRoute}
              activeUid={activeUid}
              onChange={(stops) => change({ stops })}
              onDaysChange={(days) => change({ days })}
              onActivate={setActiveUid}
            />
          )}

          {/* Host: put this route on a trip */}
          {signedIn && listings && listings.length > 0 && draft.stops.length >= 2 && (
            <div className="card space-y-3 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold"><Waypoints className="size-4 text-sunset" /> Show this route on a trip you host</p>
              {!draft.id || dirty ? (
                <p className="text-xs text-ink-soft">Save the plan first — the trip shows the saved version.</p>
              ) : (
                <div className="flex gap-2">
                  <select value={attachTo} onChange={(e) => setAttachTo(e.target.value)} className="field min-w-0 flex-1 py-2" aria-label="Trip to add the route to">
                    <option value="">Choose a trip…</option>
                    {listings.map((l) => (
                      <option key={l.listing.id} value={l.listing.id}>{l.listing.title}</option>
                    ))}
                  </select>
                  <button type="button" onClick={attach} disabled={!attachTo || attaching} className="btn-dark btn-sm">
                    {attaching ? <Loader2 className="size-4 animate-spin" /> : "Add"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Summary + save */}
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 p-4 backdrop-blur lg:static lg:z-auto lg:bg-paper">
          <Summary route={shownRoute} routing={routing} error={shownError} stops={draft.stops.length} />
          <div className="mt-3 flex items-center gap-2">
            {signedIn ? (
              <>
                <button type="button" onClick={save} disabled={saving || draft.stops.length === 0} className="btn-primary flex-1">
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  {draft.id ? "Save changes" : "Save plan"}
                </button>
                <span className="w-24 text-right text-xs text-ink-soft" aria-live="polite">
                  {dirty ? "Unsaved" : savedAt ? <span className="inline-flex items-center gap-1 text-sage"><Check className="size-3.5" /> Saved</span> : draft.id ? "Saved" : ""}
                </span>
              </>
            ) : (
              <Link href="/sign-in?next=/planner" className="btn-primary flex-1">
                <Cloud className="size-4" /> Sign in to save
              </Link>
            )}
          </div>
          {!signedIn && <p className="mt-2 text-center text-[11px] text-ink-soft">Your draft stays on this device until you sign in.</p>}
        </div>
      </aside>

      {/* ── Map ────────────────────────────────────────────────────────── */}
      {/* Phone: fills the screen under the header and the Plan/Map switch. */}
      <div className={cn("relative h-[calc(100dvh-118px)] lg:h-auto lg:flex-1", view === "list" && "hidden lg:block")}>
        <RouteMap
          stops={draft.stops}
          line={shownRoute?.coordinates}
          estimated={shownRoute ? shownRoute.estimated : draft.stops.length > 1}
          activeIndex={activeIndex >= 0 ? activeIndex : null}
          onMapClick={clickMap}
          onStopClick={(i) => setActiveUid(draft.stops[i]?.uid ?? null)}
        />
        <div className="pointer-events-none absolute left-1/2 top-4 z-[500] -translate-x-1/2 rounded-full bg-surface/95 px-4 py-2 text-xs font-medium text-ink-soft shadow-lg">
          Click the map to drop a stop
        </div>
      </div>
    </div>
  );
}

function Summary({ route, routing, error, stops }: { route: RouteResult | null; routing: boolean; error: string | null; stops: number }) {
  if (stops < 2) {
    return <p className="flex items-center gap-2 text-sm text-ink-soft"><RouteIcon className="size-4" /> Add two stops to see the route.</p>;
  }
  if (error) {
    return <p className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400"><AlertTriangle className="mt-0.5 size-4 shrink-0" /> {error}</p>;
  }
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="font-display text-xl font-extrabold leading-none text-ink">
          {route ? formatDistance(route.distanceMeters) : "—"}
          <span className="ml-2 text-base font-semibold text-ink-soft">{route ? formatDuration(route.durationSeconds) : ""}</span>
        </p>
        <p className="mt-1 text-xs text-ink-soft">
          {stops} stops{route?.estimated ? " · straight-line estimate" : route ? " · along real roads and paths" : ""}
        </p>
      </div>
      {routing && <Loader2 className="size-5 animate-spin text-sunset" aria-label="Updating route" />}
    </div>
  );
}
