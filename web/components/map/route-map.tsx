"use client";

import dynamic from "next/dynamic";
import type { RouteMapProps } from "./route-map-inner";

export type { MapStop, RouteMapProps } from "./route-map-inner";

// Leaflet touches `window`, so the map only renders in the browser.
export const RouteMap = dynamic<RouteMapProps>(() => import("./route-map-inner"), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse bg-fd-muted" />,
});
