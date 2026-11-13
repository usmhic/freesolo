package com.freesolo.api.dto.planning;

import com.freesolo.api.dto.routing.RouteResult;

import java.time.LocalDateTime;
import java.util.List;

public record PlanResponse(
        String id,
        String title,
        String profile,
        String startDate,
        List<PlanStop> stops,
        RouteResult route,
        double distanceMeters,
        double durationSeconds,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
