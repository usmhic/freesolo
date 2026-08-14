package com.freesolo.api.dto.experience;

import com.freesolo.api.entity.Business;
import com.freesolo.api.entity.Experience;
import com.freesolo.api.entity.User;

import java.time.LocalDateTime;

public record ExperienceResponse(
        String id,
        HostSnippet host,
        BusinessSnippet business,
        String title,
        String description,
        String category,
        String emoji,
        String city,
        String country,
        Double lat,
        Double lng,
        String date,
        String time,
        int durationMins,
        int minSeats,
        int maxSeats,
        double price,
        String currency,
        String coverImage,
        String images,
        String tags,
        String status,
        boolean featured,
        long filledSeats,
        long availableSeats,
        LocalDateTime createdAt
) {
    public record HostSnippet(String id, String name, String image) {}
    public record BusinessSnippet(String id, String name, String address, String city) {}

    public static ExperienceResponse from(Experience e, long filledSeats) {
        User host = e.getHost();
        Business biz = e.getBusiness();
        long available = Math.max(0, e.getMaxSeats() - filledSeats);
        return new ExperienceResponse(
                e.getId(),
                new HostSnippet(host.getId(), host.getName(), host.getImage()),
                new BusinessSnippet(biz.getId(), biz.getName(), biz.getAddress(), biz.getCity()),
                e.getTitle(), e.getDescription(), e.getCategory(), e.getEmoji(),
                e.getCity(), e.getCountry(), e.getLat(), e.getLng(),
                e.getDate(), e.getTime(), e.getDurationMins(),
                e.getMinSeats(), e.getMaxSeats(), e.getPrice(), e.getCurrency(),
                e.getCoverImage(), e.getImages(), e.getTags(), e.getStatus(), e.isFeatured(),
                filledSeats, available, e.getCreatedAt()
        );
    }
}
