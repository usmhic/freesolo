"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Loader2, MapPin, MousePointerClick, Search } from "lucide-react";
import { api, ClientApiError } from "@/lib/client-api";
import type { PlaceResult } from "./types";

/**
 * Place search backed by /api/routing/places (OpenRouteService on the
 * server). When the server has no routing key, search is unavailable and we
 * point people at clicking the map instead.
 */
export function PlaceSearch({
  focus,
  onPick,
}: {
  focus: { lat: number; lng: number } | null;
  onPick: (place: PlaceResult) => void;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const listId = useId();
  const reqId = useRef(0);

  useEffect(() => {
    const text = q.trim();
    if (text.length < 2 || unavailable) return;
    const id = ++reqId.current;
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ q: text });
        if (focus) {
          params.set("lat", focus.lat.toFixed(4));
          params.set("lng", focus.lng.toFixed(4));
        }
        const data = await api<PlaceResult[]>(`/api/routing/places?${params}`);
        if (id !== reqId.current) return;
        setResults(data);
        setError(null);
        setHighlight(0);
        setOpen(true);
      } catch (e) {
        if (id !== reqId.current) return;
        if (e instanceof ClientApiError && e.status === 503) setUnavailable(true);
        else setError(e instanceof Error ? e.message : "Search failed");
        setResults([]);
      } finally {
        if (id === reqId.current) setLoading(false);
      }
    }, 280);
    return () => clearTimeout(t);
  }, [q, focus, unavailable]);

  // Results for a query that's since been cleared are stale.
  const shown = q.trim().length >= 2 ? results : [];

  function pick(p: PlaceResult) {
    onPick(p);
    setQ("");
    setResults([]);
    setOpen(false);
  }

  if (unavailable) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-dashed border-line bg-surface px-4 py-3 text-sm text-ink-soft">
        <MousePointerClick className="mt-0.5 size-4 shrink-0 text-sunset" />
        <span>
          <span className="font-semibold text-ink">Click the map to add a stop.</span> Place search isn&apos;t
          switched on for this server yet.
        </span>
      </div>
    );
  }

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
      <input
        type="search"
        role="combobox"
        aria-expanded={open && shown.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && shown[highlight] ? `${listId}-${highlight}` : undefined}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (!shown.length) return;
          if (e.key === "ArrowDown") { e.preventDefault(); setHighlight((h) => (h + 1) % shown.length); }
          if (e.key === "ArrowUp") { e.preventDefault(); setHighlight((h) => (h - 1 + shown.length) % shown.length); }
          if (e.key === "Enter") { e.preventDefault(); pick(shown[highlight]); }
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="Add a place — town, landmark, address…"
        aria-label="Search for a place to add"
        className="field h-12 rounded-2xl pl-11 pr-10"
      />
      {loading && <Loader2 className="absolute right-4 top-1/2 size-4 -translate-y-1/2 animate-spin text-ink-soft" />}
      {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
      {open && shown.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-[1000] mt-2 overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
        >
          {shown.map((r, i) => (
            <li
              key={`${r.label}-${i}`}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === highlight}
              onMouseDown={(e) => { e.preventDefault(); pick(r); }}
              onMouseEnter={() => setHighlight(i)}
              className={`flex cursor-pointer items-center gap-3 px-4 py-3 text-sm ${i === highlight ? "bg-sunset-soft" : ""}`}
            >
              <MapPin className="size-4 shrink-0 text-sunset" />
              <span className="min-w-0">
                <span className="block truncate font-medium text-ink">{r.name}</span>
                <span className="block truncate text-xs text-ink-soft">{[r.locality, r.country].filter(Boolean).join(", ")}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
      {open && !loading && q.trim().length >= 2 && shown.length === 0 && !error && (
        <p className="mt-2 text-xs text-ink-soft">No places found — try another spelling, or click the map.</p>
      )}
    </div>
  );
}
