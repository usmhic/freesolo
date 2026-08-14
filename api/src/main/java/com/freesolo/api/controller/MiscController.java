package com.freesolo.api.controller;

import com.freesolo.api.repository.UserRepository;
import com.freesolo.api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class MiscController {

    private final UserRepository userRepository;

    /** GET /api/unsubscribe?email=... */
    @GetMapping("/api/unsubscribe")
    @Transactional
    public ResponseEntity<Map<String, String>> unsubscribe(@RequestParam String email) {
        userRepository.findByEmail(email.toLowerCase()).ifPresent(user -> {
            user.setMarketingOptIn(false);
            userRepository.save(user);
        });
        return ResponseEntity.ok(Map.of("message", "Unsubscribed from marketing emails"));
    }
}
