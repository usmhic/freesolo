package com.freesolo.api.dto.experience;

import jakarta.validation.constraints.Min;

public record BookExperienceRequest(
        @Min(1) int seats,
        String guestNote
) {}
