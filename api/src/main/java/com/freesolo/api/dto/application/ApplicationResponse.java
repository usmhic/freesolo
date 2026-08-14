package com.freesolo.api.dto.application;

import com.freesolo.api.entity.Application;

import java.time.LocalDateTime;

public record ApplicationResponse(
        String id,
        UserSnippet user,
        String story,
        String imageUrl,
        String status,
        String reviewNote,
        LocalDateTime reviewedAt,
        LocalDateTime createdAt
) {
    public record UserSnippet(String id, String email, String name, String image) {}

    public static ApplicationResponse from(Application a) {
        var u = a.getUser();
        return new ApplicationResponse(
                a.getId(),
                new UserSnippet(u.getId(), u.getEmail(), u.getName(), u.getImage()),
                a.getStory(), a.getImageUrl(), a.getStatus(),
                a.getReviewNote(), a.getReviewedAt(), a.getCreatedAt()
        );
    }
}
