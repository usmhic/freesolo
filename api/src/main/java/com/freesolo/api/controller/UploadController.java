package com.freesolo.api.controller;

import com.freesolo.api.entity.*;
import com.freesolo.api.exception.ApiException;
import com.freesolo.api.repository.*;
import com.freesolo.api.security.UserPrincipal;
import com.freesolo.api.service.StorageService;
import com.freesolo.api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    private final StorageService storageService;
    private final UserService userService;
    private final UploadRepository uploadRepository;
    private final EventPhotoRepository eventPhotoRepository;
    private final ExperienceRepository experienceRepository;
    private final BookingRepository bookingRepository;

    private static final java.util.Set<String> VALID_TYPES =
            java.util.Set.of("avatar", "general", "event-photo", "experience", "application", "business");

    /** POST /api/upload */
    @PostMapping
    @Transactional
    public ResponseEntity<Map<String, Object>> upload(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "general") String type,
            @RequestParam(required = false) String experienceId,
            @RequestParam(required = false) String bookingId,
            @RequestParam(required = false) String caption) {

        if (!VALID_TYPES.contains(type)) {
            throw ApiException.badRequest("Invalid upload type");
        }

        User user = userService.getById(principal.getId());
        StorageService.UploadResult result = storageService.upload(file, type, user.getId());

        // Persist upload record
        Upload upload = Upload.builder()
                .user(user)
                .url(result.url())
                .key(result.key())
                .type(type)
                .size(result.size())
                .build();
        uploadRepository.save(upload);

        // If it's an event photo, create event photo record
        if ("event-photo".equals(type) && experienceId != null && bookingId != null) {
            Experience exp = experienceRepository.findById(experienceId).orElse(null);
            Booking booking = bookingRepository.findById(bookingId).orElse(null);
            if (exp != null && booking != null) {
                EventPhoto photo = EventPhoto.builder()
                        .experience(exp)
                        .booking(booking)
                        .user(user)
                        .url(result.url())
                        .key(result.key())
                        .caption(caption)
                        .build();
                eventPhotoRepository.save(photo);
            }
        }

        return ResponseEntity.status(201).body(Map.of(
                "id", upload.getId(),
                "url", result.url(),
                "key", result.key(),
                "type", type,
                "size", result.size()
        ));
    }
}
