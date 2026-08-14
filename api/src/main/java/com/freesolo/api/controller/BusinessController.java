package com.freesolo.api.controller;

import com.freesolo.api.dto.business.BusinessResponse;
import com.freesolo.api.dto.business.CreateBusinessRequest;
import com.freesolo.api.dto.common.PageResponse;
import com.freesolo.api.security.UserPrincipal;
import com.freesolo.api.service.BusinessService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/businesses")
@RequiredArgsConstructor
public class BusinessController {

    private final BusinessService businessService;

    /** GET /api/businesses */
    @GetMapping
    public ResponseEntity<PageResponse<BusinessResponse>> list(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(businessService.list(city, type, page, Math.min(50, limit)));
    }

    /** GET /api/businesses/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<BusinessResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(businessService.getById(id));
    }

    /** POST /api/businesses */
    @PostMapping
    public ResponseEntity<BusinessResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateBusinessRequest req) {
        return ResponseEntity.status(201).body(businessService.create(principal.getId(), req));
    }
}
