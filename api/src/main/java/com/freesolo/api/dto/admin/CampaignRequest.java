package com.freesolo.api.dto.admin;

import jakarta.validation.constraints.NotBlank;

public record CampaignRequest(
        @NotBlank String title,
        @NotBlank String subject,
        @NotBlank String body,
        @NotBlank String segment,
        String scheduledAt
) {}
