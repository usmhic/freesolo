package com.freesolo.api.controller;

import com.freesolo.api.dto.routing.DirectionsRequest;
import com.freesolo.api.dto.routing.PlaceResult;
import com.freesolo.api.dto.routing.RouteResult;
import com.freesolo.api.security.UserPrincipal;
import com.freesolo.api.service.RateLimiter;
import com.freesolo.api.service.RoutingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Place search and directions for the trip planner. Open to signed-out
 * visitors so they can try planning, and rate-limited per member or address
 * because every call spends the shared OpenRouteService quota.
 */
@RestController
@RequestMapping("/api/routing")
@RequiredArgsConstructor
public class RoutingController {

    static final int PLACE_SEARCHES_PER_MINUTE = 60;
    static final int ROUTES_PER_MINUTE = 20;

    private final RoutingService routingService;
    private final RateLimiter rateLimiter;

    /** GET /api/routing/status — whether real routing is available or routes are estimates. */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        return ResponseEntity.ok(Map.of(
                "routing", routingService.isConfigured(),
                "profiles", RoutingService.PROFILES.keySet().stream().sorted().toList()));
    }

    /** GET /api/routing/places?q=…&lat=…&lng=… */
    @GetMapping("/places")
    public ResponseEntity<List<PlaceResult>> places(@RequestParam("q") String q,
                                                    @RequestParam(required = false) Double lat,
                                                    @RequestParam(required = false) Double lng,
                                                    @AuthenticationPrincipal UserPrincipal principal,
                                                    HttpServletRequest request) {
        rateLimiter.check("places", clientKey(principal, request), PLACE_SEARCHES_PER_MINUTE);
        return ResponseEntity.ok(routingService.searchPlaces(q, lat, lng));
    }

    /** POST /api/routing/directions */
    @PostMapping("/directions")
    public ResponseEntity<RouteResult> directions(@Valid @RequestBody DirectionsRequest req,
                                                  @AuthenticationPrincipal UserPrincipal principal,
                                                  HttpServletRequest request) {
        rateLimiter.check("routes", clientKey(principal, request), ROUTES_PER_MINUTE);
        return ResponseEntity.ok(routingService.route(req.profile(), req.coordinates()));
    }

    private static String clientKey(UserPrincipal principal, HttpServletRequest request) {
        if (principal != null) return "u:" + principal.getId();
        // The web app proxies /api/**, so the visitor's address is the first forwarded hop.
        String forwarded = request.getHeader("X-Forwarded-For");
        String ip = forwarded != null && !forwarded.isBlank() ? forwarded.split(",")[0].trim() : request.getRemoteAddr();
        return "ip:" + ip;
    }
}
