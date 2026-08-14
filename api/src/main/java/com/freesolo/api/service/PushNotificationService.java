package com.freesolo.api.service;

import com.freesolo.api.config.AppProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PushNotificationService {

    private final AppProperties props;

    public void send(String pushToken, String title, String body, Map<String, Object> data) {
        if (pushToken == null || pushToken.isBlank()) return;
        try {
            var payload = Map.of(
                    "to", pushToken,
                    "title", title,
                    "body", body,
                    "data", data != null ? data : Map.of(),
                    "sound", "default"
            );

            var client = RestClient.create();
            var request = client.post()
                    .uri("https://exp.host/--/api/v2/push/send")
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Accept", "application/json");

            String token = props.getExpo().getAccessToken();
            if (token != null && !token.isBlank()) {
                request.header("Authorization", "Bearer " + token);
            }

            request.body(List.of(payload)).retrieve().toBodilessEntity();
        } catch (Exception e) {
            log.warn("Push notification failed for token {}: {}", pushToken, e.getMessage());
        }
    }
}
