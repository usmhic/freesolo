package com.freesolo.api.service;

import com.freesolo.api.entity.Notification;
import com.freesolo.api.entity.User;
import com.freesolo.api.repository.NotificationRepository;
import com.freesolo.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final PushNotificationService pushService;

    @Transactional
    public Notification create(String userId, String type, String title, String body,
                               Map<String, Object> data) {
        User user = userRepository.findById(userId).orElseThrow();

        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .body(body)
                .data(data != null ? mapToJson(data) : "{}")
                .build();
        notification = notificationRepository.save(notification);

        // Fire push notification if user has a token
        if (user.getPushToken() != null) {
            pushService.send(user.getPushToken(), title, body, data);
            notification.setSentPush(true);
            notificationRepository.save(notification);
        }

        return notification;
    }

    private String mapToJson(Map<String, Object> map) {
        StringBuilder sb = new StringBuilder("{");
        map.forEach((k, v) -> {
            if (sb.length() > 1) sb.append(",");
            sb.append("\"").append(k).append("\":\"").append(v).append("\"");
        });
        sb.append("}");
        return sb.toString();
    }
}
