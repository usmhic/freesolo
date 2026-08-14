package com.freesolo.api.security;

import com.freesolo.api.config.AppProperties;
import com.freesolo.api.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
@Slf4j
public class JwtProvider {

    private final AppProperties props;

    public JwtProvider(AppProperties props) {
        String secret = props.getJwt().getSecret();
        if (secret == null || secret.length() < 32) {
            throw new IllegalStateException("JWT_SECRET must be configured with at least 32 characters");
        }
        this.props = props;
    }

    private SecretKey key() {
        byte[] keyBytes = props.getJwt().getSecret().getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generate(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", user.getEmail());
        claims.put("name", user.getName());
        claims.put("image", user.getImage());
        claims.put("role", user.getRole());
        claims.put("status", user.getStatus());
        if (user.getPrimaryBusinessId() != null) {
            claims.put("businessId", user.getPrimaryBusinessId());
        }

        long now = System.currentTimeMillis();
        return Jwts.builder()
                .subject(user.getId())
                .claims(claims)
                .issuedAt(new Date(now))
                .expiration(new Date(now + props.getJwt().getExpirationMs()))
                .signWith(key())
                .compact();
    }

    public Claims validate(String token) {
        return Jwts.parser()
                .verifyWith(key())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isValid(String token) {
        try {
            validate(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("Invalid JWT: {}", e.getMessage());
            return false;
        }
    }

    public String getUserId(String token) {
        return validate(token).getSubject();
    }

    public String getRole(String token) {
        return validate(token).get("role", String.class);
    }

    public String getBusinessId(String token) {
        return validate(token).get("businessId", String.class);
    }
}
