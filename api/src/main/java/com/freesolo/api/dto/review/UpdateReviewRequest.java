package com.freesolo.api.dto.review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record UpdateReviewRequest(
        @Min(1) @Max(5) int rating,
        String body,
        String reply
) {}
