"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";
import { useTheme } from "next-themes";

export interface MapStop {
  name: string;
  lat: number;
  lng: number;
}

export interface RouteMapProps {
  stops: MapStop[];
  /** Route line as [lng, lat] pairs (GeoJSON order). */
  line?: [number, number][] | null;
  /** Dashed line = straight-line estimate rather than a real route. */
  estimated?: boolean;
  activeIndex?: number | null;
  onMapClick?: (lat: number, lng: number) => void;
  onStopClick?: (index: number) => void;
  className?: string;
  interactive?: boolean;
}

// Basemap tiles. The default is OpenStreetMap's own raster tiles: free and
// keyless, but meant for modest traffic (operations.osmfoundation.org/policies/tiles).
// For production scale, set NEXT_PUBLIC_MAP_TILE_URL (and optionally a
// _DARK_URL and _ATTRIBUTION) to a provider you have an account with.
const CUSTOM_LIGHT = process.env.NEXT_PUBLIC_MAP_TILE_URL;
const CUSTOM_DARK = process.env.NEXT_PUBLIC_MAP_TILE_DARK_URL;
const TILES = {
  light: CUSTOM_LIGHT || "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  dark: CUSTOM_DARK || CUSTOM_LIGHT || "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
};
// Without a dedicated dark style, dark mode tints the light tiles in CSS.
const FILTER_DARK_TILES = !CUSTOM_DARK;
const ATTRIBUTION =
  process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION ||
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

function stopIcon(n: number, active: boolean) {
  return L.divIcon({
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    html: `<span style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:9999px;
      background:${active ? "#FF6D1D" : "#233846"};color:#fff;font:700 12px/1 var(--font-body),system-ui,sans-serif;
      border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)">${n}</span>`,
  });
}

function fitTo(map: L.Map, stops: MapStop[], line?: [number, number][] | null) {
  const pts: [number, number][] = [
    ...stops.map((s) => [s.lat, s.lng] as [number, number]),
    ...((line ?? []).map(([lng, lat]) => [lat, lng]) as [number, number][]),
  ];
  if (pts.length === 0) return;
  if (pts.length === 1) map.setView(pts[0], Math.max(map.getZoom(), 11));
  else map.fitBounds(L.latLngBounds(pts), { padding: [48, 48], maxZoom: 13 });
}

function FitBounds({ stops, line }: { stops: MapStop[]; line?: [number, number][] | null }) {
  const map = useMap();
  // Refit only when the set of stops changes, not on every re-render.
  const key = stops.map((s) => `${s.lat.toFixed(4)},${s.lng.toFixed(4)}`).join("|");
  useEffect(() => {
    fitTo(map, stops, line);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  return null;
}

function ClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/**
 * Keeps Leaflet's size in sync with its container (panels, sheets) and, when
 * the map was hidden and becomes visible (the phone Map tab), frames the route.
 */
function ResizeWatcher({ stops, line }: { stops: MapStop[]; line?: [number, number][] | null }) {
  const map = useMap();
  const latest = useRef({ stops, line });
  useEffect(() => {
    latest.current = { stops, line };
  });
  useEffect(() => {
    const el = map.getContainer();
    let wasHidden = el.clientWidth === 0 || el.clientHeight === 0;
    const ro = new ResizeObserver(() => {
      map.invalidateSize();
      const hidden = el.clientWidth === 0 || el.clientHeight === 0;
      if (wasHidden && !hidden) fitTo(map, latest.current.stops, latest.current.line);
      wasHidden = hidden;
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [map]);
  return null;
}

export default function RouteMapInner({
  stops,
  line,
  estimated,
  activeIndex,
  onMapClick,
  onStopClick,
  className,
  interactive = true,
}: RouteMapProps) {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  const positions = useMemo(
    () =>
      line && line.length > 1
        ? line.map(([lng, lat]) => [lat, lng] as [number, number])
        : stops.map((s) => [s.lat, s.lng] as [number, number]),
    [line, stops]
  );
  const center: [number, number] = stops[0] ? [stops[0].lat, stops[0].lng] : [39.5, -8.0];

  return (
    <MapContainer
      center={center}
      zoom={stops.length ? 9 : 6}
      scrollWheelZoom={interactive}
      dragging={interactive}
      zoomControl={interactive}
      // `isolate` keeps Leaflet's internal z-indexes (400+) from painting over the sticky header.
      className={["isolate", className, dark && FILTER_DARK_TILES ? "map-tiles-dark" : ""].filter(Boolean).join(" ")}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        key={resolvedTheme}
        url={dark ? TILES.dark : TILES.light}
        attribution={ATTRIBUTION}
        subdomains="abcd"
        maxZoom={19}
      />
      {positions.length > 1 && (
        <>
          <Polyline positions={positions} pathOptions={{ color: "#ffffff", weight: 9, opacity: 0.9 }} />
          <Polyline
            positions={positions}
            pathOptions={{ color: "#FF6D1D", weight: 5, opacity: 1, dashArray: estimated ? "2 10" : undefined, lineCap: "round" }}
          />
        </>
      )}
      {stops.map((s, i) => (
        <Marker
          key={`${i}-${s.lat}-${s.lng}`}
          position={[s.lat, s.lng]}
          icon={stopIcon(i + 1, activeIndex === i)}
          eventHandlers={onStopClick ? { click: () => onStopClick(i) } : undefined}
        >
          <Tooltip direction="top" offset={[0, -14]}>{s.name}</Tooltip>
        </Marker>
      ))}
      <FitBounds stops={stops} line={line} />
      <ClickHandler onMapClick={onMapClick} />
      <ResizeWatcher stops={stops} line={line} />
    </MapContainer>
  );
}
