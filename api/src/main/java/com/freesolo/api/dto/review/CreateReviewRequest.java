package com.freesolo.api.dto.review;

import jakarta.validation.constraints.*;

public record CreateReviewRequest(
        @NotBlank String bookingId,
        @Min(1) @Max(5) int rating,
        @NotBlank @Size(min = 10, message = "Review must be at least 10 characters") String body
) {}
