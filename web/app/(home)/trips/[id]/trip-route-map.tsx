"use client";

import { RouteMap } from "@/components/map/route-map";
import type { TripRoute } from "@/lib/listings";

export function TripRouteMap({ route }: { route: TripRoute }) {
  return <RouteMap stops={route.stops} line={route.coordinates} estimated={route.estimated} />;
}
