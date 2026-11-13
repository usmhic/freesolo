package com.freesolo.api.dto.planning;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;

public record SavePlanRequest(
        @NotBlank @Size(max = 120, message = "Give the plan a title of up to 120 characters") String title,
        @NotBlank String profile,
        @Size(max = 32) String startDate,
        @NotNull @Size(max = 25, message = "A plan can have at most 25 stops") List<@Valid PlanStop> stops
) {}
