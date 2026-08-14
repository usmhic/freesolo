package com.freesolo.api.controller;

import com.freesolo.api.dto.booking.BookingResponse;
import com.freesolo.api.dto.common.PageResponse;
import com.freesolo.api.dto.experience.BookExperienceRequest;
import com.freesolo.api.dto.experience.CreateExperienceRequest;
import com.freesolo.api.dto.experience.ExperienceResponse;
import com.freesolo.api.entity.EventPhoto;
import com.freesolo.api.entity.Experience;
import com.freesolo.api.entity.User;
import com.freesolo.api.exception.ApiException;
import com.freesolo.api.repository.EventPhotoRepository;
import com.freesolo.api.repository.ExperienceRepository;
import com.freesolo.api.security.UserPrincipal;
import com.freesolo.api.service.BookingService;
import com.freesolo.api.service.ExperienceService;
import com.freesolo.api.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/experiences")
@RequiredArgsConstructor
public class ExperienceController {

    private final ExperienceService experienceService;
    private final BookingService bookingService;
    private final UserService userService;
    private final ExperienceRepository experienceRepository;
    private final EventPhotoRepository eventPhotoRepository;

    /** GET /api/experiences */
    @GetMapping
    public ResponseEntity<PageResponse<ExperienceResponse>> list(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        limit = Math.min(50, Math.max(1, limit));
        return ResponseEntity.ok(experienceService.list(city, category, page, limit));
    }

    /** GET /api/experiences/featured */
    @GetMapping("/featured")
    public ResponseEntity<List<ExperienceResponse>> featured() {
        return ResponseEntity.ok(experienceService.getFeatured());
    }

    /** GET /api/experiences/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<ExperienceResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(experienceService.getById(id));
    }

    /** POST /api/experiences */
    @PostMapping
    public ResponseEntity<ExperienceResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateExperienceRequest req) {
        User user = userService.getById(principal.getId());
        return ResponseEntity.status(201).body(experienceService.create(user, req));
    }

    /** POST /api/experiences/{id}/book */
    @PostMapping("/{id}/book")
    public ResponseEntity<BookingResponse> book(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody BookExperienceRequest req) {
        return ResponseEntity.status(201).body(bookingService.createBooking(principal.getId(), id, req));
    }

    /** GET /api/experiences/{id}/photos */
    @GetMapping("/{id}/photos")
    public ResponseEntity<List<Map<String, Object>>> photos(@PathVariable String id) {
        Experience exp = experienceRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Experience not found"));
        List<Map<String, Object>> photos = eventPhotoRepository.findByExperience(exp).stream()
                .map(p -> Map.<String, Object>of(
                        "id", p.getId(),
                        "url", p.getUrl(),
                        "caption", p.getCaption() != null ? p.getCaption() : "",
                        "createdAt", p.getCreatedAt()
                )).toList();
        return ResponseEntity.ok(photos);
    }
}
