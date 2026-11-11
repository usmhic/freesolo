package com.freesolo.api.dto.planning;

import jakarta.validation.constraints.*;

/** One stop on a journey. {@code day} groups stops into days (1-based) and is optional. */
public record PlanStop(
        @NotBlank @Size(max = 200) String name,
        @DecimalMin("-90") @DecimalMax("90") double lat,
        @DecimalMin("-180") @DecimalMax("180") double lng,
        @Min(1) @Max(60) Integer day,
        @Size(max = 1000) String note
) {}
