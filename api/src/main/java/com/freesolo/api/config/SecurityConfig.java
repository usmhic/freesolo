package com.freesolo.api.config;

import com.freesolo.api.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            // Picks up the CorsConfigurationSource bean from WebConfig. Without
            // this the security chain rejects browser preflights before CORS is
            // ever applied, which surfaces in the client as a 403.
            .cors(Customizer.withDefaults())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // CORS preflights carry no credentials by design — they must be
                // answered before any authorization rule applies.
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // Public auth endpoints
                .requestMatchers("/api/auth/**").permitAll()
                // Public read endpoints
                .requestMatchers(HttpMethod.GET, "/api/experiences").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/experiences/featured").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/experiences/{id}").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/businesses").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/businesses/{id}").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/reviews").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/users/{id}").permitAll()
                // Application submission (unauthenticated)
                .requestMatchers(HttpMethod.POST, "/api/applications").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/applications/{reference}/status").permitAll()
                // Unsubscribe (unauthenticated)
                .requestMatchers(HttpMethod.GET, "/api/unsubscribe").permitAll()
                // Health check
                .requestMatchers("/actuator/health").permitAll()
                // OpenAPI. /v3/api-docs.yaml is a sibling path, not a child of
                // /v3/api-docs, so it needs its own matcher; /webjars/** serves
                // the Swagger UI assets.
                .requestMatchers(
                        "/v3/api-docs", "/v3/api-docs/**", "/v3/api-docs.yaml",
                        "/swagger-ui", "/swagger-ui/**", "/swagger-ui.html",
                        "/webjars/**").permitAll()
                // Admin GET endpoints: accessible to admin + business dashboard users
                .requestMatchers(HttpMethod.GET, "/api/admin/**").hasAnyRole("ADMIN", "BUSINESS")
                // Admin mutating endpoints: admin only
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // Everything else requires auth
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
