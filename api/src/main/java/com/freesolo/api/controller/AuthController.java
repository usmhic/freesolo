package com.freesolo.api.controller;

import com.freesolo.api.config.AppProperties;
import com.freesolo.api.dto.auth.AuthResponse;
import com.freesolo.api.dto.auth.SendOtpRequest;
import com.freesolo.api.dto.auth.VerifyOtpRequest;
import com.freesolo.api.dto.user.UserResponse;
import com.freesolo.api.security.JwtProvider;
import com.freesolo.api.security.UserPrincipal;
import com.freesolo.api.service.AuthService;
import com.freesolo.api.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final JwtProvider jwtProvider;
    private final AppProperties props;

    /** POST /api/auth/otp/send — send OTP to email */
    @PostMapping("/otp/send")
    public ResponseEntity<Map<String, String>> sendOtp(@Valid @RequestBody SendOtpRequest req) {
        authService.sendOtp(req.email());
        return ResponseEntity.ok(Map.of("message", "Code sent to " + req.email()));
    }

    /** POST /api/auth/otp/verify — verify OTP, return JWT */
    @PostMapping("/otp/verify")
    public ResponseEntity<AuthResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest req,
                                                   HttpServletResponse response) {
        AuthResponse auth = authService.verifyOtp(req.email(), req.code());
        setTokenCookie(response, auth.token());
        return ResponseEntity.ok(auth);
    }

    /** GET /api/auth/oauth/{provider}/authorize — get OAuth redirect URL */
    @GetMapping("/oauth/{provider}/authorize")
    public ResponseEntity<Map<String, String>> getOAuthUrl(
            @PathVariable String provider,
            @RequestParam(required = false) String redirect_uri) {
        return ResponseEntity.ok(authService.getOAuthUrl(provider, redirect_uri));
    }

    /** GET /api/auth/oauth/{provider}/callback — OAuth callback from provider */
    @GetMapping("/oauth/{provider}/callback")
    public Object oauthCallback(@PathVariable String provider,
                                 @RequestParam String code,
                                 @RequestParam(required = false) String state,
                                 HttpServletResponse response) {
        AuthResponse auth = authService.handleOAuthCallback(provider, code, state);
        setTokenCookie(response, auth.token());

        // If state is a deep link (mobile), redirect with token
        String redirectUri = state != null ? new String(java.util.Base64.getUrlDecoder().decode(state)) : null;
        if (redirectUri != null && (redirectUri.startsWith("freesolo://") || redirectUri.startsWith("exp://"))) {
            return new RedirectView(redirectUri + "?token=" + auth.token());
        }
        // For web, redirect to admin dashboard
        return new RedirectView(props.getFrontendUrl() + "/admin");
    }

    /** POST /api/auth/oauth/{provider}/callback — Apple uses POST (form_post) */
    @PostMapping("/oauth/{provider}/callback")
    public Object oauthCallbackPost(@PathVariable String provider,
                                     @RequestParam String code,
                                     @RequestParam(required = false) String state,
                                     HttpServletResponse response) {
        return oauthCallback(provider, code, state, response);
    }

    /** GET /api/auth/session — current authenticated user */
    @GetMapping("/session")
    public ResponseEntity<Map<String, Object>> session(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) return ResponseEntity.ok(Map.of("user", (Object) null));
        UserResponse user = UserResponse.from(userService.getById(principal.getId()));
        return ResponseEntity.ok(Map.of("user", user));
    }

    /** POST /api/auth/signout — clear session cookie */
    @PostMapping("/signout")
    public ResponseEntity<Map<String, String>> signout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("freesolo-token", "")
                .httpOnly(true)
                .secure(props.getCookie().isSecure())
                .path("/")
                .maxAge(0)
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
        return ResponseEntity.ok(Map.of("message", "Signed out"));
    }

    /** GET /api/auth/ok — health check for auth subsystem */
    @GetMapping("/ok")
    public ResponseEntity<Map<String, String>> ok() {
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    private void setTokenCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from("freesolo-token", token)
                .httpOnly(true)
                .secure(props.getCookie().isSecure())
                .sameSite(props.getCookie().getSameSite())
                .path("/")
                .maxAge(props.getJwt().getExpirationMs() / 1000)
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }
}
