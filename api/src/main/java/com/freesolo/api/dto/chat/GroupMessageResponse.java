package com.freesolo.api.dto.chat;

import com.freesolo.api.entity.GroupMessage;
import com.freesolo.api.entity.User;

import java.time.LocalDateTime;

public record GroupMessageResponse(
        String id,
        String body,
        LocalDateTime createdAt,
        Author author
) {
    public record Author(String id, String name, String image, boolean host) {}

    public static GroupMessageResponse from(GroupMessage m) {
        User a = m.getAuthor();
        boolean host = m.getExperience().getHost().getId().equals(a.getId());
        return new GroupMessageResponse(m.getId(), m.getBody(), m.getCreatedAt(),
                new Author(a.getId(), a.getName(), a.getImage(), host));
    }
}
