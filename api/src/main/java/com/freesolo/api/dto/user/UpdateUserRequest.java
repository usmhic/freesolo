package com.freesolo.api.dto.user;

public record UpdateUserRequest(
        String name,
        String phone,
        String bio,
        String image,
        Boolean marketingOptIn
) {}
