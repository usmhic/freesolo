package com.freesolo.api.dto.business;

import jakarta.validation.constraints.NotBlank;

public record CreateBusinessRequest(
        @NotBlank String name,
        @NotBlank String type,
        @NotBlank String address,
        @NotBlank String city,
        String country,
        Double lat,
        Double lng,
        String mapsLink,
        String tripadvisor,
        String instagram,
        String website,
        String description,
        String coverImage
) {}
