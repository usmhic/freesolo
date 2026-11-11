"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo } from "react";
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

// CARTO basemaps (OpenStreetMap data): light "Voyager" and dark variants that
// follow the site theme. Free with attribution; no key.
const TILES = {
  light: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
};
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

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

function FitBounds({ stops, line }: { stops: MapStop[]; line?: [number, number][] | null }) {
  const map = useMap();
  // Refit only when the set of stops changes, not on every re-render.
  const key = stops.map((s) => `${s.lat.toFixed(4)},${s.lng.toFixed(4)}`).join("|");
  useEffect(() => {
    const pts: [number, number][] = [
      ...stops.map((s) => [s.lat, s.lng] as [number, number]),
      ...((line ?? []).map(([lng, lat]) => [lat, lng]) as [number, number][]),
    ];
    if (pts.length === 0) return;
    if (pts.length === 1) map.setView(pts[0], Math.max(map.getZoom(), 11));
    else map.fitBounds(L.latLngBounds(pts), { padding: [48, 48], maxZoom: 13 });
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

/** Keeps Leaflet's size in sync when the map's container is resized (panels, sheets). */
function ResizeWatcher() {
  const map = useMap();
  useEffect(() => {
    const el = map.getContainer();
    const ro = new ResizeObserver(() => map.invalidateSize());
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
      className={className}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        key={resolvedTheme}
        url={resolvedTheme === "dark" ? TILES.dark : TILES.light}
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
      <ResizeWatcher />
    </MapContainer>
  );
}
