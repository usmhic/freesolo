package com.freesolo.api.service;

import com.freesolo.api.config.AppProperties;
import com.freesolo.api.dto.auth.AuthResponse;
import com.freesolo.api.dto.user.UserResponse;
import com.freesolo.api.entity.OauthAccount;
import com.freesolo.api.entity.OtpCode;
import com.freesolo.api.entity.User;
import com.freesolo.api.exception.ApiException;
import com.freesolo.api.repository.OauthAccountRepository;
import com.freesolo.api.repository.OtpCodeRepository;
import com.freesolo.api.repository.UserRepository;
import com.freesolo.api.security.JwtProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final OtpCodeRepository otpCodeRepository;
    private final OauthAccountRepository oauthAccountRepository;
    private final JwtProvider jwtProvider;
    private final EmailService emailService;
    private final AppProperties props;

    private final SecureRandom random = new SecureRandom();

    @Transactional
    public void sendOtp(String email) {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> ApiException.notFound("No account found with that email. Apply to join at freesolo.app/apply"));

        // Delete old OTPs for this user
        otpCodeRepository.deleteByUser(user);

        String code = String.format("%06d", random.nextInt(999999));
        OtpCode otp = OtpCode.builder()
                .user(user)
                .code(code)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .build();
        otpCodeRepository.save(otp);
        emailService.sendOtpCode(email, code);
    }

    @Transactional
    public AuthResponse verifyOtp(String email, String code) {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> ApiException.unauthorized("Invalid code"));

        OtpCode otp = otpCodeRepository
                .findTopByUserAndCodeAndExpiresAtAfterOrderByCreatedAtDesc(user, code, LocalDateTime.now())
                .orElseThrow(() -> ApiException.unauthorized("Code is invalid or has expired"));

        otpCodeRepository.deleteByUser(user);

        if (!user.isEmailVerified()) {
            user.setEmailVerified(true);
            userRepository.save(user);
        }

        return buildAuthResponse(user);
    }

    @Transactional
    public Map<String, String> getOAuthUrl(String provider, String redirectUri) {
        String clientId = switch (provider) {
            case "google" -> props.getOauth().getGoogle().getClientId();
            case "apple"  -> props.getOauth().getApple().getClientId();
            default -> throw ApiException.badRequest("Unknown provider: " + provider);
        };

        String state = java.util.Base64.getUrlEncoder().encodeToString(
                (redirectUri != null ? redirectUri : props.getFrontendUrl()).getBytes());

        String url = switch (provider) {
            case "google" -> "https://accounts.google.com/o/oauth2/v2/auth?" +
                    "client_id=" + clientId +
                    "&redirect_uri=" + java.net.URLEncoder.encode(
                            props.getFrontendUrl() + "/api/auth/oauth/google/callback",
                            java.nio.charset.StandardCharsets.UTF_8) +
                    "&response_type=code&scope=openid%20email%20profile&state=" + state;
            case "apple" -> "https://appleid.apple.com/auth/authorize?" +
                    "client_id=" + clientId +
                    "&redirect_uri=" + java.net.URLEncoder.encode(
                            props.getFrontendUrl() + "/api/auth/oauth/apple/callback",
                            java.nio.charset.StandardCharsets.UTF_8) +
                    "&response_type=code&scope=name%20email&response_mode=form_post&state=" + state;
            default -> throw ApiException.badRequest("Unknown provider");
        };

        return Map.of("url", url);
    }

    @Transactional
    public AuthResponse handleOAuthCallback(String provider, String code, String state) {
        OAuthUserInfo info = fetchOAuthUserInfo(provider, code);

        Optional<OauthAccount> existingAccount =
                oauthAccountRepository.findByProviderIdAndAccountId(provider, info.id());

        User user;
        if (existingAccount.isPresent()) {
            user = existingAccount.get().getUser();
        } else {
            // Find or create user by email
            user = userRepository.findByEmail(info.email().toLowerCase()).orElse(null);

            if (user == null) {
                // New user — create with pending status (must apply first)
                user = User.builder()
                        .email(info.email().toLowerCase())
                        .name(info.name())
                        .image(info.picture())
                        .emailVerified(true)
                        .build();
                // Auto-promote admin email
                if (user.getEmail().equalsIgnoreCase(props.getAdminEmail())) {
                    user.setRole("admin");
                    user.setStatus("approved");
                }
                user = userRepository.save(user);
            } else if (!user.isEmailVerified()) {
                user.setEmailVerified(true);
                userRepository.save(user);
            }

            OauthAccount account = OauthAccount.builder()
                    .user(user)
                    .providerId(provider)
                    .accountId(info.id())
                    .build();
            oauthAccountRepository.save(account);
        }

        return buildAuthResponse(user);
    }

    private record OAuthUserInfo(String id, String email, String name, String picture) {}

    private OAuthUserInfo fetchOAuthUserInfo(String provider, String code) {
        if ("google".equals(provider)) {
            return fetchGoogleUserInfo(code);
        }
        throw ApiException.badRequest("Provider not implemented: " + provider);
    }

    @SuppressWarnings("unchecked")
    private OAuthUserInfo fetchGoogleUserInfo(String code) {
        // Exchange code for tokens
        Map<String, String> tokenRequest = Map.of(
                "code", code,
                "client_id", props.getOauth().getGoogle().getClientId(),
                "client_secret", props.getOauth().getGoogle().getClientSecret(),
                "redirect_uri", props.getFrontendUrl() + "/api/auth/oauth/google/callback",
                "grant_type", "authorization_code"
        );

        Map<?, ?> tokenResponse = RestClient.create()
                .post()
                .uri("https://oauth2.googleapis.com/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(buildFormBody(tokenRequest))
                .retrieve()
                .body(Map.class);

        if (tokenResponse == null || !tokenResponse.containsKey("access_token")) {
            throw ApiException.unauthorized("Failed to obtain access token from Google");
        }

        String accessToken = (String) tokenResponse.get("access_token");

        // Fetch user info
        Map<?, ?> userInfo = RestClient.create()
                .get()
                .uri("https://www.googleapis.com/oauth2/v2/userinfo")
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .body(Map.class);

        if (userInfo == null) throw ApiException.internal("Failed to fetch Google user info");

        return new OAuthUserInfo(
                (String) userInfo.get("id"),
                (String) userInfo.get("email"),
                (String) userInfo.get("name"),
                (String) userInfo.get("picture")
        );
    }

    private String buildFormBody(Map<String, String> params) {
        StringBuilder sb = new StringBuilder();
        params.forEach((k, v) -> {
            if (!sb.isEmpty()) sb.append("&");
            sb.append(java.net.URLEncoder.encode(k, java.nio.charset.StandardCharsets.UTF_8))
              .append("=")
              .append(java.net.URLEncoder.encode(v, java.nio.charset.StandardCharsets.UTF_8));
        });
        return sb.toString();
    }

    private AuthResponse buildAuthResponse(User user) {
        // Load primary business ID for business-role users
        if ("business".equals(user.getRole()) && !user.getBusinesses().isEmpty()) {
            user.setPrimaryBusinessId(user.getBusinesses().stream()
                    .min(java.util.Comparator.comparing(b -> b.getCreatedAt()))
                    .map(b -> b.getId())
                    .orElse(null));
        }
        String token = jwtProvider.generate(user);
        return new AuthResponse(token, UserResponse.from(user));
    }
}
