package com.freesolo.api.controller;

import com.freesolo.api.dto.planning.PlanResponse;
import com.freesolo.api.dto.planning.SavePlanRequest;
import com.freesolo.api.security.UserPrincipal;
import com.freesolo.api.service.PlanService;
import com.freesolo.api.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** The signed-in member's saved journey plans. */
@RestController
@RequestMapping("/api/plans")
@RequiredArgsConstructor
public class PlanController {

    private final PlanService planService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<PlanResponse>> list(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(planService.list(principal.getId()));
    }

    @PostMapping
    public ResponseEntity<PlanResponse> create(@AuthenticationPrincipal UserPrincipal principal,
                                               @Valid @RequestBody SavePlanRequest req) {
        return ResponseEntity.status(201).body(planService.create(userService.getById(principal.getId()), req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlanResponse> get(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        return ResponseEntity.ok(planService.get(principal.getId(), id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlanResponse> update(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String id,
                                               @Valid @RequestBody SavePlanRequest req) {
        return ResponseEntity.ok(planService.update(principal.getId(), id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String id) {
        planService.delete(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
