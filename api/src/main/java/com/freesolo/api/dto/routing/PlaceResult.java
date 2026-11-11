package com.freesolo.api.dto.routing;

/** A place suggestion from geocoding: a label to show and where it is. */
public record PlaceResult(
        String label,
        String name,
        String locality,
        String country,
        double lat,
        double lng
) {}
