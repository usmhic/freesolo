package com.freesolo.api.dto.experience;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;

/**
 * Creates a listing. {@code kind} is {@code experience} (the default: a few
 * hours at one of the host's approved venues) or {@code trip} (several days,
 * {@code endDate} required, venue optional, day-by-day {@code itinerary}).
 */
public record CreateExperienceRequest(
        @Pattern(regexp = "experience|trip", message = "Kind must be experience or trip") String kind,
        String businessId,
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
        String endDate,
        @Min(30) Integer durationMins,
        @Min(2) Integer minSeats,
        @Min(2) Integer maxSeats,
        @Positive double price,
        String currency,
        String coverImage,
        List<String> tags,
        @Size(max = 30, message = "An itinerary can have at most 30 days") List<@Valid ItineraryDay> itinerary,
        @Size(max = 20) List<@NotBlank String> included,
        @Pattern(regexp = "instant|approval", message = "Join policy must be instant or approval") String joinPolicy
) {
    public record ItineraryDay(
            @NotBlank @Size(max = 120) String title,
            @Size(max = 2000) String description
    ) {}
}
