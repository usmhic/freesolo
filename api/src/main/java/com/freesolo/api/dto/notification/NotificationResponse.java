package com.freesolo.api.dto.notification;

import com.freesolo.api.entity.Notification;

import java.time.LocalDateTime;

public record NotificationResponse(
        String id,
        String type,
        String title,
        String body,
        String data,
        boolean read,
        LocalDateTime createdAt
) {
    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(
                n.getId(), n.getType(), n.getTitle(), n.getBody(),
                n.getData(), n.isRead(), n.getCreatedAt()
        );
    }
}
