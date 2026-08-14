package com.freesolo.api.controller;

import com.freesolo.api.dto.common.PageResponse;
import com.freesolo.api.dto.review.CreateReviewRequest;
import com.freesolo.api.dto.review.ReviewResponse;
import com.freesolo.api.dto.review.UpdateReviewRequest;
import com.freesolo.api.security.UserPrincipal;
import com.freesolo.api.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    /** GET /api/reviews */
    @GetMapping
    public ResponseEntity<PageResponse<ReviewResponse>> list(
            @RequestParam(required = false) String experienceId,
            @RequestParam(required = false) String hostId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(reviewService.list(experienceId, hostId, page, Math.min(50, limit)));
    }

    /** GET /api/reviews/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<ReviewResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(reviewService.getById(id));
    }

    /** POST /api/reviews */
    @PostMapping
    public ResponseEntity<ReviewResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateReviewRequest req) {
        return ResponseEntity.status(201).body(reviewService.create(principal.getId(), req));
    }

    /** PATCH /api/reviews/{id} */
    @PatchMapping("/{id}")
    public ResponseEntity<ReviewResponse> update(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateReviewRequest req) {
        return ResponseEntity.ok(reviewService.update(id, principal.getId(), req));
    }
}
