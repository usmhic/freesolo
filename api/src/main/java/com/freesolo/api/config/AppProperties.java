package com.freesolo.api.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@ConfigurationProperties(prefix = "app")
@Data
public class AppProperties {

    private Jwt jwt = new Jwt();
    private String adminEmail;
    private Cors cors = new Cors();
    private String frontendUrl;
    private Cookie cookie = new Cookie();
    private Resend resend = new Resend();
    private Minio minio = new Minio();
    private Expo expo = new Expo();
    private String appStoreUrl;
    private String playStoreUrl;
    private OAuth oauth = new OAuth();
    private Ors ors = new Ors();
    private Ai ai = new Ai();

    @Data
    public static class Jwt {
        private String secret;
        private long expirationMs;
    }

    @Data
    public static class Cors {
        private List<String> allowedOrigins =
                List.of("http://localhost:*", "http://127.0.0.1:*", "exp://*", "freesolo://*");
    }

    @Data
    public static class Cookie {
        private boolean secure = false;
        private String sameSite = "Lax";
    }

    @Data
    public static class Resend {
        private String apiKey;
        private String from;
    }

    @Data
    public static class Minio {
        private String endpoint;
        private String publicUrl;
        private String accessKey;
        private String secretKey;
        private String bucket;
    }

    @Data
    public static class Expo {
        private String accessToken;
    }

    /** OpenRouteService: geocoding and directions for the trip planner. Optional. */
    @Data
    public static class Ors {
        private String apiKey;
        private String baseUrl = "https://api.openrouteservice.org";
        private int timeoutMs = 8000;
    }

    /**
     * OpenRouter, used to judge game answers (text and photos) with any model
     * it offers. Optional: without a key and model, answers are checked
     * against each lesson's accepted list.
     */
    @Data
    public static class Ai {
        private String apiKey;
        private String model;
        private String baseUrl = "https://openrouter.ai/api/v1";
        private int timeoutMs = 20000;
        /** Sent as OpenRouter's HTTP-Referer / X-Title so usage is attributed to the app. */
        private String appUrl;
        private String appName = "FreeSolo";
    }

    @Data
    public static class OAuth {
        private Provider google = new Provider();
        private Provider apple = new Provider();

        @Data
        public static class Provider {
            private String clientId;
            private String clientSecret;
        }
    }
}
