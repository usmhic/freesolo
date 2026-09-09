package com.freesolo.api.dto.user;

import com.freesolo.api.entity.User;

import java.time.LocalDateTime;

public record UserResponse(
        String id,
        String email,
        boolean emailVerified,
        String name,
        String image,
        String phone,
        String bio,
        String role,
        String status,
        int countriesVisited,
        boolean marketingOptIn,
        LocalDateTime createdAt
) {
    public static UserResponse from(User u) {
        return new UserResponse(
                u.getId(), u.getEmail(), u.isEmailVerified(),
                u.getName(), u.getImage(), u.getPhone(), u.getBio(),
                u.getRole(), u.getStatus(),
                u.getCountriesVisited(), u.isMarketingOptIn(), u.getCreatedAt()
        );
    }
}
