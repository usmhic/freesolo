package com.freesolo.api.dto.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

public record AdminUpdateUserRequest(
        @NotBlank String name,
        @NotBlank @Email String email,
        String phone,
        String bio,
        @PositiveOrZero int countriesVisited
) {}
