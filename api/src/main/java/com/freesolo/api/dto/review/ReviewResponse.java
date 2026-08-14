package com.freesolo.api.dto.review;

import com.freesolo.api.entity.Review;

import java.time.LocalDateTime;

public record ReviewResponse(
        String id,
        AuthorSnippet author,
        String experienceId,
        String bookingId,
        int rating,
        String body,
        String reply,
        LocalDateTime createdAt
) {
    public record AuthorSnippet(String id, String name, String image) {}

    public static ReviewResponse from(Review r) {
        var a = r.getAuthor();
        return new ReviewResponse(
                r.getId(),
                new AuthorSnippet(a.getId(), a.getName(), a.getImage()),
                r.getExperience() != null ? r.getExperience().getId() : null,
                r.getBooking().getId(),
                r.getRating(), r.getBody(), r.getReply(), r.getCreatedAt()
        );
    }
}
