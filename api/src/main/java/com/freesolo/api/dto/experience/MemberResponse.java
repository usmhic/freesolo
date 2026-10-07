package com.freesolo.api.dto.experience;

import com.freesolo.api.entity.Booking;
import com.freesolo.api.entity.User;

/** A traveler who holds a seat on a listing — the "who's going" list. */
public record MemberResponse(
        String id,
        String name,
        String image,
        int countriesVisited,
        String status
) {
    public static MemberResponse from(Booking b) {
        User u = b.getUser();
        return new MemberResponse(u.getId(), u.getName(), u.getImage(), u.getCountriesVisited(), b.getStatus());
    }
}
