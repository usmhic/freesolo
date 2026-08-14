package com.freesolo.api.dto.application;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ReviewApplicationRequest(
        @NotBlank @Pattern(regexp = "approved|rejected") String decision,
        String reviewNote
) {}
