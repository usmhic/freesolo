package com.freesolo.api.controller;

import com.freesolo.api.dto.application.ApplicationResponse;
import com.freesolo.api.dto.application.ApplicationStatusResponse;
import com.freesolo.api.dto.application.CreateApplicationRequest;
import com.freesolo.api.dto.common.PageResponse;
import com.freesolo.api.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    /** POST /api/applications — unauthenticated join request */
    @PostMapping
    public ResponseEntity<ApplicationResponse> submit(@Valid @RequestBody CreateApplicationRequest req) {
        return ResponseEntity.status(201).body(applicationService.submit(req));
    }

    /** GET /api/applications/{reference}/status — public lookup by reference */
    @GetMapping("/{reference}/status")
    public ResponseEntity<ApplicationStatusResponse> status(@PathVariable String reference) {
        return ResponseEntity.ok(applicationService.status(reference));
    }

    /** GET /api/applications — admin only */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PageResponse<ApplicationResponse>> list(
            @RequestParam(defaultValue = "pending") String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(applicationService.list(status, page, Math.min(50, limit)));
    }
}
