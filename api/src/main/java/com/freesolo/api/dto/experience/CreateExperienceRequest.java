package com.freesolo.api.dto.experience;

import jakarta.validation.constraints.*;

import java.util.List;

public record CreateExperienceRequest(
        @NotBlank String businessId,
        @NotBlank @Size(min = 4, message = "Title must be at least 4 characters") String title,
        @NotBlank @Size(min = 20, message = "Description too short") String description,
        @NotBlank String category,
        String emoji,
        @NotBlank String city,
        String country,
        Double lat,
        Double lng,
        @NotBlank String date,
        @NotBlank String time,
        @Min(30) Integer durationMins,
        @Min(2) Integer minSeats,
        @Min(2) Integer maxSeats,
        @Positive double price,
        String currency,
        String coverImage,
        List<String> tags
) {}
