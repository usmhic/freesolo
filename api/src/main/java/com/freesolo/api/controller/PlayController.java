package com.freesolo.api.controller;

import com.freesolo.api.dto.play.PlayDtos.*;
import com.freesolo.api.security.UserPrincipal;
import com.freesolo.api.service.LeaderboardService;
import com.freesolo.api.service.PlayService;
import com.freesolo.api.service.RateLimiter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * The city history game. Browsing and free lessons are open to everyone;
 * saved progress and city packs need a signed-in player. Answer checks are
 * rate-limited because each one may call the AI judge.
 */
@RestController
@RequestMapping("/api/play")
@RequiredArgsConstructor
public class PlayController {

    static final int ATTEMPTS_PER_MINUTE = 15;
    static final int JOURNEYS_PER_MINUTE = 20;

    private final PlayService playService;
    private final LeaderboardService leaderboardService;
    private final RateLimiter rateLimiter;

    @GetMapping("/ranks")
    public ResponseEntity<List<Rank>> ranks() {
        return ResponseEntity.ok(playService.ranks());
    }

    @GetMapping("/cities")
    public ResponseEntity<List<CitySummary>> cities(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(playService.cities(userId(principal)));
    }

    @GetMapping("/cities/{id}")
    public ResponseEntity<CityView> city(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        return ResponseEntity.ok(playService.city(userId(principal), id));
    }

    /** POST /api/play/cities/{id}/unlock — the city pack (free during the pilot). */
    @PostMapping("/cities/{id}/unlock")
    public ResponseEntity<CityView> unlock(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        return ResponseEntity.ok(playService.unlock(principal.getId(), id));
    }

    @GetMapping("/lessons/{id}")
    public ResponseEntity<LessonView> lesson(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        return ResponseEntity.ok(playService.lesson(userId(principal), id));
    }

    @PostMapping("/lessons/{id}/attempts")
    public ResponseEntity<AttemptResult> attempt(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String id,
                                                 @Valid @RequestBody AttemptRequest req, HttpServletRequest request) {
        rateLimiter.check("play-attempts", clientKey(principal, request), ATTEMPTS_PER_MINUTE);
        return ResponseEntity.ok(playService.attempt(userId(principal), id, req));
    }

    @PostMapping("/journeys")
    public ResponseEntity<JourneyView> journey(@AuthenticationPrincipal UserPrincipal principal,
                                               @Valid @RequestBody JourneyRequest req, HttpServletRequest request) {
        rateLimiter.check("play-journeys", clientKey(principal, request), JOURNEYS_PER_MINUTE);
        return ResponseEntity.ok(playService.journey(userId(principal), req));
    }

    /** GET /api/play/leaderboard?period=all|week — the global ranking, with your own row when signed in. */
    @GetMapping("/leaderboard")
    public ResponseEntity<Leaderboard> leaderboard(@AuthenticationPrincipal UserPrincipal principal,
                                                   @RequestParam(defaultValue = "all") String period) {
        return ResponseEntity.ok(leaderboardService.leaderboard(period, userId(principal)));
    }

    @GetMapping("/me")
    public ResponseEntity<PlayerView> me(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(playService.player(principal.getId()));
    }

    private static String userId(UserPrincipal principal) {
        return principal == null ? null : principal.getId();
    }

    private static String clientKey(UserPrincipal principal, HttpServletRequest request) {
        if (principal != null) return "u:" + principal.getId();
        String forwarded = request.getHeader("X-Forwarded-For");
        String ip = forwarded != null && !forwarded.isBlank() ? forwarded.split(",")[0].trim() : request.getRemoteAddr();
        return "ip:" + ip;
    }
}
