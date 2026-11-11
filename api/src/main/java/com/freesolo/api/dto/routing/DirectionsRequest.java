package com.freesolo.api.dto.routing;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/** Ordered stops to route between, as {@code [lng, lat]} pairs. */
public record DirectionsRequest(
        @NotBlank String profile,
        @NotNull @Size(min = 2, max = 25, message = "A route needs between 2 and 25 stops") List<double[]> coordinates
) {}
