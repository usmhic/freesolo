package com.freesolo.api.controller;

import com.freesolo.api.dto.user.PushTokenRequest;
import com.freesolo.api.dto.user.UpdateUserRequest;
import com.freesolo.api.dto.user.UserResponse;
import com.freesolo.api.security.UserPrincipal;
import com.freesolo.api.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /** GET /api/users/me */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(UserResponse.from(userService.getById(principal.getId())));
    }

    /** PATCH /api/users/me */
    @PatchMapping("/me")
    public ResponseEntity<UserResponse> updateMe(@AuthenticationPrincipal UserPrincipal principal,
                                                  @RequestBody UpdateUserRequest req) {
        return ResponseEntity.ok(userService.updateProfile(principal.getId(), req));
    }

    /** GET /api/users/{id} — public profile */
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable String id) {
        return ResponseEntity.ok(userService.getPublicProfile(id));
    }

    /** POST /api/users/me/push-token */
    @PostMapping("/me/push-token")
    public ResponseEntity<Map<String, String>> registerPushToken(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PushTokenRequest req) {
        userService.registerPushToken(principal.getId(), req.token());
        return ResponseEntity.ok(Map.of("message", "Push token registered"));
    }
}
