package com.freesolo.api.controller;

import com.freesolo.api.dto.common.PageResponse;
import com.freesolo.api.dto.notification.NotificationResponse;
import com.freesolo.api.entity.Notification;
import com.freesolo.api.entity.User;
import com.freesolo.api.exception.ApiException;
import com.freesolo.api.repository.NotificationRepository;
import com.freesolo.api.security.UserPrincipal;
import com.freesolo.api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserService userService;

    /** GET /api/notifications */
    @GetMapping
    public ResponseEntity<PageResponse<NotificationResponse>> list(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        User user = userService.getById(principal.getId());
        Page<Notification> result = notificationRepository.findByUserOrderByCreatedAtDesc(
                user, PageRequest.of(page - 1, Math.min(50, limit)));
        List<NotificationResponse> responses = result.getContent().stream()
                .map(NotificationResponse::from).toList();
        long unread = notificationRepository.countByUserAndReadFalse(user);
        return ResponseEntity.ok(PageResponse.of(responses, result.getTotalElements(), page, limit));
    }

    /** POST /api/notifications/{id}/read */
    @PostMapping("/{id}/read")
    @Transactional
    public ResponseEntity<Map<String, String>> markRead(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Notification not found"));
        if (!n.getUser().getId().equals(principal.getId())) throw ApiException.forbidden("Access denied");
        n.setRead(true);
        notificationRepository.save(n);
        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }

    /** POST /api/notifications/read-all */
    @PostMapping("/read-all")
    @Transactional
    public ResponseEntity<Map<String, String>> markAllRead(
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = userService.getById(principal.getId());
        notificationRepository.markAllRead(user);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }
}
