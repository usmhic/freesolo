package com.freesolo.api.dto.business;

import com.freesolo.api.entity.Business;

import java.time.LocalDateTime;

public record BusinessResponse(
        String id,
        OwnerSnippet owner,
        String name,
        String type,
        String address,
        String city,
        String country,
        Double lat,
        Double lng,
        String mapsLink,
        String tripadvisor,
        String instagram,
        String website,
        String description,
        String coverImage,
        String images,
        String status,
        LocalDateTime createdAt
) {
    public record OwnerSnippet(String id, String name, String image) {}

    public static BusinessResponse from(Business b) {
        var o = b.getOwner();
        return new BusinessResponse(
                b.getId(),
                new OwnerSnippet(o.getId(), o.getName(), o.getImage()),
                b.getName(), b.getType(), b.getAddress(), b.getCity(), b.getCountry(),
                b.getLat(), b.getLng(), b.getMapsLink(), b.getTripadvisor(),
                b.getInstagram(), b.getWebsite(), b.getDescription(),
                b.getCoverImage(), b.getImages(), b.getStatus(), b.getCreatedAt()
        );
    }
}
