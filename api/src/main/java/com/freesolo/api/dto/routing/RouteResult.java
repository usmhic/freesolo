package com.freesolo.api.dto.routing;

import java.util.List;

/**
 * A computed route between ordered stops. {@code coordinates} are
 * {@code [lng, lat]} pairs (GeoJSON order) along the road network; when no
 * routing provider is configured they are just the stops themselves and
 * {@code estimated} is true.
 */
public record RouteResult(
        String profile,
        double distanceMeters,
        double durationSeconds,
        List<double[]> coordinates,
        List<Leg> legs,
        boolean estimated
) {
    public record Leg(double distanceMeters, double durationSeconds) {}
}
