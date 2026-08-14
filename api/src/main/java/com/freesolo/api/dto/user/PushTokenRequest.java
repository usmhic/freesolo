package com.freesolo.api.dto.user;

import jakarta.validation.constraints.NotBlank;

public record PushTokenRequest(@NotBlank String token) {}
