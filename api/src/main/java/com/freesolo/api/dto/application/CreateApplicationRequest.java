package com.freesolo.api.dto.application;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateApplicationRequest(
        @NotBlank @Email String email,
        @NotBlank String name,
        @NotBlank @Size(min = 20, message = "Tell us your story (min 20 chars)") String story,
        String imageUrl
) {}
