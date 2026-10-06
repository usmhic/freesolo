package com.freesolo.api.dto.booking;

import com.freesolo.api.entity.Booking;

import java.time.LocalDateTime;

public record BookingResponse(
        String id,
        ExperienceSnippet experience,
        int seats,
        String status,
        String guestNote,
        String cancelReason,
        LocalDateTime confirmedAt,
        LocalDateTime cancelledAt,
        LocalDateTime completedAt,
        LocalDateTime createdAt,
        boolean hasReview
) {
    public record ExperienceSnippet(String id, String kind, String title, String date, String endDate,
                                    String time, String city, String coverImage) {}

    public static BookingResponse from(Booking b) {
        var e = b.getExperience();
        return new BookingResponse(
                b.getId(),
                new ExperienceSnippet(e.getId(), e.getKind(), e.getTitle(), e.getDate(), e.getEndDate(),
                        e.getTime(), e.getCity(), e.getCoverImage()),
                b.getSeats(), b.getStatus(),
                b.getGuestNote(), b.getCancelReason(),
                b.getConfirmedAt(), b.getCancelledAt(), b.getCompletedAt(), b.getCreatedAt(),
                b.getReview() != null
        );
    }
}
