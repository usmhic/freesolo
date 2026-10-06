package com.freesolo.api.dto.hosting;

import com.freesolo.api.entity.Booking;
import com.freesolo.api.entity.User;

import java.time.LocalDateTime;

/** A traveler asking to join one of the host's listings, with enough profile to decide. */
public record JoinRequestResponse(
        String id,
        String status,
        int seats,
        String message,
        LocalDateTime createdAt,
        Traveler traveler
) {
    public record Traveler(String id, String name, String image, String bio, int countriesVisited,
                           LocalDateTime memberSince) {}

    public static JoinRequestResponse from(Booking b) {
        User u = b.getUser();
        return new JoinRequestResponse(
                b.getId(), b.getStatus(), b.getSeats(), b.getGuestNote(), b.getCreatedAt(),
                new Traveler(u.getId(), u.getName(), u.getImage(), u.getBio(), u.getCountriesVisited(),
                        u.getCreatedAt()));
    }
}
