package com.freesolo.api.controller;

import com.freesolo.api.dto.business.BusinessResponse;
import com.freesolo.api.dto.hosting.DecideJoinRequest;
import com.freesolo.api.dto.hosting.HostedListingResponse;
import com.freesolo.api.dto.hosting.JoinRequestResponse;
import com.freesolo.api.security.UserPrincipal;
import com.freesolo.api.service.BookingService;
import com.freesolo.api.service.BusinessService;
import com.freesolo.api.service.ExperienceService;
import com.freesolo.api.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** The signed-in member's side of hosting: their listings, venues, and who gets in. */
@RestController
@RequestMapping("/api/hosting")
@RequiredArgsConstructor
public class HostingController {

    private final ExperienceService experienceService;
    private final BookingService bookingService;
    private final BusinessService businessService;
    private final UserService userService;

    /** GET /api/hosting/listings */
    @GetMapping("/listings")
    public ResponseEntity<List<HostedListingResponse>> listings(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(experienceService.getHostedBy(userService.getById(principal.getId())));
    }

    /** GET /api/hosting/venues — the member's own venues, approved or not. */
    @GetMapping("/venues")
    public ResponseEntity<List<BusinessResponse>> venues(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(businessService.getOwnedBy(principal.getId()));
    }

    /** GET /api/hosting/listings/{id}/requests — join requests and the current group. */
    @GetMapping("/listings/{id}/requests")
    public ResponseEntity<List<JoinRequestResponse>> requests(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(bookingService.getJoinRequests(principal.getId(), id));
    }

    /** POST /api/hosting/requests/{bookingId}/approve */
    @PostMapping("/requests/{bookingId}/approve")
    public ResponseEntity<JoinRequestResponse> approve(
            @PathVariable String bookingId,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody(required = false) DecideJoinRequest req) {
        return ResponseEntity.ok(bookingService.approveJoinRequest(
                principal.getId(), bookingId, req != null ? req.note() : null));
    }

    /** POST /api/hosting/requests/{bookingId}/decline */
    @PostMapping("/requests/{bookingId}/decline")
    public ResponseEntity<JoinRequestResponse> decline(
            @PathVariable String bookingId,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody(required = false) DecideJoinRequest req) {
        return ResponseEntity.ok(bookingService.declineJoinRequest(
                principal.getId(), bookingId, req != null ? req.note() : null));
    }
}
