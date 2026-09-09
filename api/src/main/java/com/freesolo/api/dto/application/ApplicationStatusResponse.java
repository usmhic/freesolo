package com.freesolo.api.dto.application;

import com.freesolo.api.entity.Application;

import java.time.LocalDateTime;

/**
 * Public view of an application, looked up by its reference.
 *
 * Deliberately narrower than {@link ApplicationResponse}: it carries no user id
 * and no {@code reviewNote}, because the note is an internal reviewer comment.
 * Only what an applicant needs to see about their own submission.
 */
public record ApplicationStatusResponse(
        String reference,
        String name,
        String status,
        LocalDateTime submittedAt,
        LocalDateTime reviewedAt
) {
    public static ApplicationStatusResponse from(Application a) {
        return new ApplicationStatusResponse(
                a.getId(),
                a.getUser().getName(),
                a.getStatus(),
                a.getCreatedAt(),
                a.getReviewedAt()
        );
    }
}
