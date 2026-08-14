package com.freesolo.api.dto.auth;

import com.freesolo.api.dto.user.UserResponse;

public record AuthResponse(
        String token,
        UserResponse user
) {}
