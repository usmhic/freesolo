package com.freesolo.api.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class WebConfig {

    private final AppProperties props;

    /**
     * CORS for the whole application.
     *
     * This is exposed as a CorsConfigurationSource rather than through
     * WebMvcConfigurer#addCorsMappings because Spring Security's filter chain
     * runs before Spring MVC. MVC-level CORS never sees a browser preflight:
     * OPTIONS arrives without credentials, the security chain rejects it as
     * unauthenticated, and the browser reports the real request as blocked.
     * SecurityConfig picks this bean up via http.cors(), which puts CORS
     * handling in front of authorization where preflights are answered.
     *
     * Mapped to /** rather than /api/** so the OpenAPI documents and the
     * actuator health endpoint are reachable from a browser too.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // Patterns, not plain origins: the defaults use wildcards for local
        // dev ports, and allowCredentials forbids a bare "*" origin.
        config.setAllowedOriginPatterns(props.getCors().getAllowedOrigins());
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
