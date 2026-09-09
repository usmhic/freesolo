package com.freesolo.api.controller;

import com.freesolo.api.dto.admin.AdminUpdateUserRequest;
import com.freesolo.api.dto.admin.CampaignRequest;
import com.freesolo.api.dto.application.ReviewApplicationRequest;
import com.freesolo.api.dto.common.PageResponse;
import com.freesolo.api.entity.*;
import com.freesolo.api.exception.ApiException;
import com.freesolo.api.repository.*;
import com.freesolo.api.security.UserPrincipal;
import com.freesolo.api.service.AdminService;
import com.freesolo.api.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final ApplicationService applicationService;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final ExperienceRepository experienceRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final UploadRepository uploadRepository;
    private final EventPhotoRepository eventPhotoRepository;
    private final EmailCampaignRepository emailCampaignRepository;

    // ── Dashboard ─────────────────────────────────────────────────────────────

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard(@AuthenticationPrincipal UserPrincipal principal) {
        String role = principal.getRole();
        String userId = principal.getId();
        String businessId = principal.getBusinessId();

        if ("admin".equals(role)) {
            return ResponseEntity.ok(adminDashboard());
        } else {
            return ResponseEntity.ok(businessDashboard(userId, businessId));
        }
    }

    private Map<String, Object> adminDashboard() {
        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        List<String> bookedStatuses = List.of("confirmed", "completed");

        long totalUsers          = userRepository.count();
        long pendingApplications = applicationRepository.countByStatus("pending");
        long pendingBusinesses   = businessRepository.countByStatus("pending");
        long activeExperiences   = experienceRepository.countByStatus("active");
        long monthBookings       = bookingRepository.countByStatusesSince(bookedStatuses, monthStart);

        List<Map<String, Object>> recentApps = applicationRepository
                .findAll(PageRequest.of(0, 5, Sort.by("createdAt").descending()))
                .stream().map(this::appMap).toList();
        List<Map<String, Object>> recentBookings = bookingRepository
                .findAll(PageRequest.of(0, 5, Sort.by("createdAt").descending()))
                .stream().map(this::bookingMap).toList();
        List<Map<String, Object>> recentReviews = reviewRepository
                .findAll(PageRequest.of(0, 5, Sort.by("createdAt").descending()))
                .stream().map(this::reviewMap).toList();

        Map<String, Object> result = new HashMap<>();
        result.put("scope", "admin");
        result.put("totalUsers", totalUsers);
        result.put("pendingApplications", pendingApplications);
        result.put("pendingBusinesses", pendingBusinesses);
        result.put("activeExperiences", activeExperiences);
        result.put("monthBookings", monthBookings);
        result.put("recentApplications", recentApps);
        result.put("recentBookings", recentBookings);
        result.put("recentReviews", recentReviews);
        return result;
    }

    private Map<String, Object> businessDashboard(String userId, String businessId) {
        if (businessId == null) {
            Map<String, Object> r = new HashMap<>();
            r.put("scope", "business");
            r.put("noBusiness", true);
            return r;
        }
        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        List<String> bookedStatuses = List.of("confirmed", "completed");

        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> ApiException.notFound("Business not found"));
        long activeExperiences   = experienceRepository.countByStatusAndBusinessId("active", businessId);
        long monthBookings       = bookingRepository.countForBusinessByStatusesSince(bookedStatuses, businessId, monthStart);

        List<Map<String, Object>> recentBookings = bookingRepository
                .findByExperienceBusinessId(businessId, PageRequest.of(0, 5, Sort.by("createdAt").descending()))
                .stream().map(this::bookingMap).toList();
        List<Map<String, Object>> recentReviews = reviewRepository
                .findByExperienceBusinessId(businessId, PageRequest.of(0, 5, Sort.by("createdAt").descending()))
                .stream().map(this::reviewMap).toList();

        Map<String, Object> result = new HashMap<>();
        result.put("scope", "business");
        result.put("business", Map.of("name", business.getName(), "status", business.getStatus()));
        result.put("activeExperiences", activeExperiences);
        result.put("monthBookings", monthBookings);
        result.put("recentBookings", recentBookings);
        result.put("recentReviews", recentReviews);
        return result;
    }

    // ── Users ────────────────────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<PageResponse<Map<String, Object>>> listUsers(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int limit) {
        Page<User> result = userRepository.search(
                q, role, status, PageRequest.of(page - 1, Math.min(200, limit), Sort.by("createdAt").descending()));
        List<Map<String, Object>> users = result.getContent().stream().map(u -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", u.getId());
            m.put("email", u.getEmail());
            m.put("name", str(u.getName()));
            m.put("phone", str(u.getPhone()));
            m.put("bio", str(u.getBio()));
            m.put("role", u.getRole());
            m.put("status", u.getStatus());
            m.put("countriesVisited", u.getCountriesVisited());
            m.put("createdAt", u.getCreatedAt());
            m.put("_count", Map.of(
                    "bookings", u.getBookings().size(),
                    "experiences", u.getExperiences().size(),
                    "businesses", u.getBusinesses().size()
            ));
            return m;
        }).toList();
        return ResponseEntity.ok(PageResponse.of(users, result.getTotalElements(), page, limit));
    }

    @PatchMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> updateUser(@PathVariable String id,
                                                           @Valid @RequestBody AdminUpdateUserRequest req) {
        adminService.updateUser(id, req);
        return ResponseEntity.ok(Map.of("message", "User updated"));
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<Map<String, String>> setRole(@PathVariable String id,
                                                        @RequestBody Map<String, String> body,
                                                        @AuthenticationPrincipal UserPrincipal principal) {
        adminService.setUserRole(id, body.get("role"), principal.getId());
        return ResponseEntity.ok(Map.of("message", "Role updated"));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<Map<String, String>> setStatus(@PathVariable String id,
                                                          @RequestBody Map<String, String> body,
                                                          @AuthenticationPrincipal UserPrincipal principal) {
        adminService.setUserStatus(id, body.get("status"), principal.getId());
        return ResponseEntity.ok(Map.of("message", "Status updated"));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable String id,
                                                           @AuthenticationPrincipal UserPrincipal principal) {
        adminService.deleteUser(id, principal.getId());
        return ResponseEntity.ok(Map.of("message", "User deleted"));
    }

    @PostMapping("/users/{id}/notify")
    public ResponseEntity<Map<String, String>> notifyUser(@PathVariable String id,
                                                           @RequestBody Map<String, String> body) {
        adminService.sendUserNotification(id, body.get("title"), body.get("body"));
        return ResponseEntity.ok(Map.of("message", "Notification sent"));
    }

    // ── Applications ─────────────────────────────────────────────────────────

    @GetMapping("/applications")
    public ResponseEntity<PageResponse<Map<String, Object>>> listApplications(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "100") int limit) {
        Page<Application> result = status != null
                ? applicationRepository.findByStatus(status, PageRequest.of(page - 1, Math.min(200, limit), Sort.by("createdAt").descending()))
                : applicationRepository.findAll(PageRequest.of(page - 1, Math.min(200, limit), Sort.by("createdAt").descending()));
        List<Map<String, Object>> list = result.getContent().stream().map(this::appMap).toList();
        return ResponseEntity.ok(PageResponse.of(list, result.getTotalElements(), page, limit));
    }

    @PatchMapping("/applications/{id}/review")
    public ResponseEntity<Map<String, String>> reviewApplication(
            @PathVariable String id,
            @Valid @RequestBody ReviewApplicationRequest req) {
        applicationService.review(id, req);
        return ResponseEntity.ok(Map.of("message", "Application " + req.decision()));
    }

    @PatchMapping("/applications/{id}/fields")
    public ResponseEntity<Map<String, String>> updateApplication(@PathVariable String id,
                                                                   @RequestBody Map<String, String> body) {
        adminService.updateApplication(id, body.get("story"), body.get("reviewNote"));
        return ResponseEntity.ok(Map.of("message", "Application updated"));
    }

    @DeleteMapping("/applications/{id}")
    public ResponseEntity<Map<String, String>> deleteApplication(@PathVariable String id) {
        adminService.deleteApplication(id);
        return ResponseEntity.ok(Map.of("message", "Application deleted"));
    }

    // ── Businesses ──────────────────────────────────────────────────────────

    @GetMapping("/businesses")
    public ResponseEntity<PageResponse<Map<String, Object>>> listBusinesses(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int limit) {
        Page<Business> result = businessRepository.findAll(
                PageRequest.of(page - 1, Math.min(200, limit), Sort.by("createdAt").descending()));
        List<Map<String, Object>> list = result.getContent().stream().map(b -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", b.getId());
            m.put("name", b.getName());
            m.put("type", str(b.getType()));
            m.put("address", str(b.getAddress()));
            m.put("city", str(b.getCity()));
            m.put("country", str(b.getCountry()));
            m.put("status", b.getStatus());
            m.put("description", str(b.getDescription()));
            m.put("website", str(b.getWebsite()));
            m.put("createdAt", b.getCreatedAt());
            Map<String, Object> ownerMap = new HashMap<>();
            ownerMap.put("id", b.getOwner().getId());
            ownerMap.put("name", str(b.getOwner().getName()));
            ownerMap.put("email", b.getOwner().getEmail());
            m.put("owner", ownerMap);
            m.put("_count", Map.of("experiences", b.getExperiences().size()));
            return m;
        }).toList();
        return ResponseEntity.ok(PageResponse.of(list, result.getTotalElements(), page, limit));
    }

    @PatchMapping("/businesses/{id}")
    public ResponseEntity<Map<String, String>> updateBusiness(@PathVariable String id,
                                                               @RequestBody Map<String, String> body) {
        adminService.updateBusiness(id,
                body.get("name"), body.get("type"), body.get("address"),
                body.get("city"), body.get("country"), body.get("description"), body.get("website"));
        return ResponseEntity.ok(Map.of("message", "Business updated"));
    }

    @PatchMapping("/businesses/{id}/status")
    public ResponseEntity<Map<String, String>> setBusinessStatus(@PathVariable String id,
                                                                   @RequestBody Map<String, String> body) {
        adminService.setBusinessStatus(id, body.get("status"));
        return ResponseEntity.ok(Map.of("message", "Business status updated"));
    }

    @DeleteMapping("/businesses/{id}")
    public ResponseEntity<Map<String, String>> deleteBusiness(@PathVariable String id) {
        adminService.deleteBusiness(id);
        return ResponseEntity.ok(Map.of("message", "Business deleted"));
    }

    // ── Experiences ─────────────────────────────────────────────────────────

    @GetMapping("/experiences")
    public ResponseEntity<PageResponse<Map<String, Object>>> listExperiences(
            @RequestParam(required = false) String businessId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int limit,
            @AuthenticationPrincipal UserPrincipal principal) {
        String effectiveBusinessId = "business".equals(principal.getRole())
                ? principal.getBusinessId()
                : businessId;

        Page<Experience> result = effectiveBusinessId != null
                ? experienceRepository.findByBusinessIdPaged(effectiveBusinessId,
                    PageRequest.of(page - 1, Math.min(200, limit)))
                : experienceRepository.findAll(
                    PageRequest.of(page - 1, Math.min(200, limit), Sort.by("createdAt").descending()));

        List<Map<String, Object>> list = result.getContent().stream().map(e -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", e.getId());
            m.put("title", e.getTitle());
            m.put("emoji", str(e.getEmoji()));
            m.put("category", e.getCategory());
            m.put("city", e.getCity());
            m.put("country", str(e.getCountry()));
            m.put("date", e.getDate());
            m.put("time", e.getTime());
            m.put("price", e.getPrice());
            m.put("currency", str(e.getCurrency()));
            m.put("status", e.getStatus());
            m.put("featured", e.isFeatured());
            m.put("durationMins", e.getDurationMins());
            m.put("minSeats", e.getMinSeats());
            m.put("maxSeats", e.getMaxSeats());
            m.put("description", str(e.getDescription()));
            m.put("createdAt", e.getCreatedAt());
            Map<String, Object> hostMap = new HashMap<>();
            hostMap.put("name", str(e.getHost().getName()));
            hostMap.put("email", e.getHost().getEmail());
            m.put("host", hostMap);
            m.put("business", Map.of("name", e.getBusiness().getName()));
            m.put("_count", Map.of("bookings", e.getBookings().size(), "reviews", e.getReviews().size()));
            return m;
        }).toList();
        return ResponseEntity.ok(PageResponse.of(list, result.getTotalElements(), page, limit));
    }

    @PatchMapping("/experiences/{id}")
    public ResponseEntity<Map<String, String>> updateExperience(@PathVariable String id,
                                                                 @RequestBody Map<String, Object> body) {
        adminService.updateExperience(id, body);
        return ResponseEntity.ok(Map.of("message", "Experience updated"));
    }

    @PatchMapping("/experiences/{id}/status")
    public ResponseEntity<Map<String, String>> setExperienceStatus(@PathVariable String id,
                                                                    @RequestBody Map<String, String> body) {
        adminService.setExperienceStatus(id, body.get("status"));
        return ResponseEntity.ok(Map.of("message", "Experience status updated"));
    }

    @PatchMapping("/experiences/{id}/featured")
    public ResponseEntity<Map<String, String>> setFeatured(@PathVariable String id,
                                                            @RequestBody Map<String, Boolean> body) {
        adminService.setExperienceFeatured(id, Boolean.TRUE.equals(body.get("featured")));
        return ResponseEntity.ok(Map.of("message", "Featured status updated"));
    }

    @PostMapping("/experiences/{id}/complete")
    public ResponseEntity<Map<String, String>> completeExperience(@PathVariable String id) {
        adminService.markExperienceCompleted(id);
        return ResponseEntity.ok(Map.of("message", "Experience marked as completed"));
    }

    @DeleteMapping("/experiences/{id}")
    public ResponseEntity<Map<String, String>> deleteExperience(@PathVariable String id) {
        adminService.deleteExperience(id);
        return ResponseEntity.ok(Map.of("message", "Experience deleted"));
    }

    // ── Bookings ─────────────────────────────────────────────────────────────

    @GetMapping("/bookings")
    public ResponseEntity<Map<String, Object>> listBookings(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "100") int limit,
            @AuthenticationPrincipal UserPrincipal principal) {
        String effectiveBusinessId = "business".equals(principal.getRole()) ? principal.getBusinessId() : null;
        boolean filterStatus = status != null && !"all".equals(status);

        Page<Booking> result;
        if (effectiveBusinessId != null && filterStatus) {
            result = bookingRepository.findByStatusAndExperienceBusinessId(status, effectiveBusinessId,
                    PageRequest.of(page - 1, Math.min(200, limit), Sort.by("createdAt").descending()));
        } else if (effectiveBusinessId != null) {
            result = bookingRepository.findByExperienceBusinessId(effectiveBusinessId,
                    PageRequest.of(page - 1, Math.min(200, limit), Sort.by("createdAt").descending()));
        } else if (filterStatus) {
            result = bookingRepository.findByStatus(status,
                    PageRequest.of(page - 1, Math.min(200, limit), Sort.by("createdAt").descending()));
        } else {
            result = bookingRepository.findAll(
                    PageRequest.of(page - 1, Math.min(200, limit), Sort.by("createdAt").descending()));
        }

        // Aggregate totals for display
        long confirmedCount = effectiveBusinessId != null
                ? bookingRepository.findByStatusAndExperienceBusinessId("confirmed", effectiveBusinessId,
                    PageRequest.of(0, 1)).getTotalElements()
                        + bookingRepository.findByStatusAndExperienceBusinessId("completed", effectiveBusinessId,
                    PageRequest.of(0, 1)).getTotalElements()
                : bookingRepository.findByStatus("confirmed", PageRequest.of(0, 1)).getTotalElements()
                        + bookingRepository.findByStatus("completed", PageRequest.of(0, 1)).getTotalElements();

        List<Map<String, Object>> list = result.getContent().stream().map(this::bookingMap).toList();

        Map<String, Object> resp = new HashMap<>();
        resp.put("data", list);
        resp.put("total", result.getTotalElements());
        resp.put("page", page);
        resp.put("limit", limit);
        resp.put("pages", (int) Math.ceil((double) result.getTotalElements() / limit));
        Map<String, Object> totalsMap = new HashMap<>();
        totalsMap.put("confirmedCount", confirmedCount);
        resp.put("totals", totalsMap);
        return ResponseEntity.ok(resp);
    }

    @PatchMapping("/bookings/{id}")
    public ResponseEntity<Map<String, String>> updateBooking(@PathVariable String id,
                                                              @RequestBody Map<String, Object> body) {
        adminService.updateBookingStatus(id,
                (String) body.get("status"),
                body.get("seats") instanceof Number ? ((Number) body.get("seats")).intValue() : 1,
                (String) body.get("guestNote"));
        return ResponseEntity.ok(Map.of("message", "Booking updated"));
    }

    @DeleteMapping("/bookings/{id}")
    public ResponseEntity<Map<String, String>> deleteBooking(@PathVariable String id) {
        adminService.deleteBooking(id);
        return ResponseEntity.ok(Map.of("message", "Booking deleted"));
    }

    // ── Reviews ─────────────────────────────────────────────────────────────

    @GetMapping("/reviews")
    public ResponseEntity<PageResponse<Map<String, Object>>> listReviews(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "100") int limit,
            @AuthenticationPrincipal UserPrincipal principal) {
        String effectiveBusinessId = "business".equals(principal.getRole()) ? principal.getBusinessId() : null;

        Page<Review> result = effectiveBusinessId != null
                ? reviewRepository.findByExperienceBusinessId(effectiveBusinessId,
                    PageRequest.of(page - 1, Math.min(200, limit)))
                : reviewRepository.findAll(
                    PageRequest.of(page - 1, Math.min(200, limit), Sort.by("createdAt").descending()));

        List<Map<String, Object>> list = result.getContent().stream().map(this::reviewMap).toList();
        return ResponseEntity.ok(PageResponse.of(list, result.getTotalElements(), page, limit));
    }

    @PatchMapping("/reviews/{id}")
    public ResponseEntity<Map<String, String>> updateReview(@PathVariable String id,
                                                             @RequestBody Map<String, Object> body) {
        adminService.updateReview(id,
                body.get("rating") instanceof Number ? ((Number) body.get("rating")).intValue() : 5,
                (String) body.get("body"),
                (String) body.get("reply"));
        return ResponseEntity.ok(Map.of("message", "Review updated"));
    }

    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<Map<String, String>> deleteReview(@PathVariable String id) {
        adminService.deleteReview(id);
        return ResponseEntity.ok(Map.of("message", "Review deleted"));
    }

    // ── Media ────────────────────────────────────────────────────────────────

    @GetMapping("/media/uploads")
    public ResponseEntity<PageResponse<Map<String, Object>>> listUploads(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "100") int limit) {
        Page<Upload> result = uploadRepository.findAll(
                PageRequest.of(page - 1, Math.min(200, limit), Sort.by("createdAt").descending()));
        List<Map<String, Object>> list = result.getContent().stream().map(u -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", u.getId());
            m.put("url", u.getUrl());
            m.put("type", u.getType());
            m.put("size", u.getSize());
            m.put("createdAt", u.getCreatedAt());
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("name", u.getUser() != null ? str(u.getUser().getName()) : "");
            userMap.put("email", u.getUser() != null ? u.getUser().getEmail() : "");
            m.put("user", userMap);
            return m;
        }).toList();
        return ResponseEntity.ok(PageResponse.of(list, result.getTotalElements(), page, limit));
    }

    @DeleteMapping("/media/uploads/{id}")
    public ResponseEntity<Map<String, String>> deleteUpload(@PathVariable String id) {
        adminService.deleteUpload(id);
        return ResponseEntity.ok(Map.of("message", "Upload deleted"));
    }

    @GetMapping("/media/event-photos")
    public ResponseEntity<PageResponse<Map<String, Object>>> listEventPhotos(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "100") int limit) {
        Page<EventPhoto> result = eventPhotoRepository.findAllByOrderByCreatedAtDesc(
                PageRequest.of(page - 1, Math.min(200, limit)));
        List<Map<String, Object>> list = result.getContent().stream().map(p -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", p.getId());
            m.put("url", p.getUrl());
            m.put("caption", str(p.getCaption()));
            m.put("createdAt", p.getCreatedAt());
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("name", p.getUser() != null ? str(p.getUser().getName()) : "");
            userMap.put("email", p.getUser() != null ? p.getUser().getEmail() : "");
            m.put("user", userMap);
            if (p.getExperience() != null) {
                Map<String, Object> expMap = new HashMap<>();
                expMap.put("title", p.getExperience().getTitle());
                expMap.put("emoji", str(p.getExperience().getEmoji()));
                expMap.put("city", p.getExperience().getCity());
                m.put("experience", expMap);
            } else {
                m.put("experience", null);
            }
            return m;
        }).toList();
        return ResponseEntity.ok(PageResponse.of(list, result.getTotalElements(), page, limit));
    }

    @DeleteMapping("/media/event-photos/{id}")
    public ResponseEntity<Map<String, String>> deleteEventPhoto(@PathVariable String id) {
        adminService.deleteEventPhoto(id);
        return ResponseEntity.ok(Map.of("message", "Event photo deleted"));
    }

    // ── Marketing ────────────────────────────────────────────────────────────

    @GetMapping("/marketing/campaigns")
    public ResponseEntity<PageResponse<Map<String, Object>>> listCampaigns(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "100") int limit) {
        Page<EmailCampaign> result = emailCampaignRepository.findAllByOrderByCreatedAtDesc(
                PageRequest.of(page - 1, Math.min(200, limit)));
        List<Map<String, Object>> list = result.getContent().stream().map(c -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", c.getId());
            m.put("title", c.getTitle());
            m.put("subject", c.getSubject());
            m.put("body", str(c.getBody()));
            m.put("segment", c.getSegment());
            m.put("status", c.getStatus());
            m.put("scheduledAt", c.getScheduledAt());
            m.put("sentAt", c.getSentAt());
            m.put("recipientCount", c.getRecipientCount());
            m.put("createdAt", c.getCreatedAt());
            Map<String, Object> createdByMap = new HashMap<>();
            if (c.getCreatedBy() != null) {
                createdByMap.put("name", str(c.getCreatedBy().getName()));
                createdByMap.put("email", c.getCreatedBy().getEmail());
            }
            m.put("createdBy", createdByMap);
            return m;
        }).toList();
        return ResponseEntity.ok(PageResponse.of(list, result.getTotalElements(), page, limit));
    }

    @PostMapping("/marketing/campaigns")
    public ResponseEntity<Map<String, Object>> createCampaign(
            @Valid @RequestBody CampaignRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        EmailCampaign c = adminService.createCampaign(req, principal.getId());
        return ResponseEntity.status(201).body(Map.of("id", c.getId(), "status", c.getStatus()));
    }

    @PatchMapping("/marketing/campaigns/{id}")
    public ResponseEntity<Map<String, String>> updateCampaign(@PathVariable String id,
                                                               @Valid @RequestBody CampaignRequest req) {
        adminService.updateCampaign(id, req);
        return ResponseEntity.ok(Map.of("message", "Campaign updated"));
    }

    @DeleteMapping("/marketing/campaigns/{id}")
    public ResponseEntity<Map<String, String>> deleteCampaign(@PathVariable String id) {
        adminService.deleteCampaign(id);
        return ResponseEntity.ok(Map.of("message", "Campaign deleted"));
    }

    @PostMapping("/marketing/campaigns/{id}/send")
    public ResponseEntity<Map<String, String>> sendCampaign(@PathVariable String id) {
        adminService.sendCampaign(id);
        return ResponseEntity.ok(Map.of("message", "Campaign sent"));
    }

    @GetMapping("/marketing/segment-counts")
    public ResponseEntity<Map<String, Long>> segmentCounts() {
        LocalDateTime ninetyDaysAgo = LocalDateTime.now().minusDays(90);
        Map<String, Long> counts = new HashMap<>();
        counts.put("all",                  userRepository.countByMarketingOptInTrueAndStatus("approved"));
        counts.put("travelers",            userRepository.countByMarketingOptInTrueAndStatusAndRole("approved", "traveler"));
        counts.put("hosts",                userRepository.countMarketingHosts());
        counts.put("pending_applications", userRepository.countByMarketingOptInTrueAndStatus("pending"));
        counts.put("inactive",             userRepository.countMarketingInactive(ninetyDaysAgo));
        return ResponseEntity.ok(counts);
    }

    // ── Legacy stats endpoint ─────────────────────────────────────────────────

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> stats() {
        return ResponseEntity.ok(Map.of(
                "users",               userRepository.count(),
                "experiences",         experienceRepository.count(),
                "activeExperiences",   experienceRepository.countByStatus("active"),
                "businesses",          businessRepository.count(),
                "pendingBusinesses",   businessRepository.countByStatus("pending"),
                "bookings",            bookingRepository.count(),
                "reviews",             reviewRepository.count()
        ));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String str(String s) { return s != null ? s : ""; }

    private Map<String, Object> appMap(Application a) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", a.getId());
        m.put("story", str(a.getStory()));
        m.put("imageUrl", a.getImageUrl());
        m.put("status", a.getStatus());
        m.put("reviewNote", a.getReviewNote());
        m.put("reviewedAt", a.getReviewedAt());
        m.put("createdAt", a.getCreatedAt());
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", a.getUser().getId());
        userMap.put("name", str(a.getUser().getName()));
        userMap.put("email", a.getUser().getEmail());
        userMap.put("phone", str(a.getUser().getPhone()));
        userMap.put("createdAt", a.getUser().getCreatedAt());
        m.put("user", userMap);
        return m;
    }

    private Map<String, Object> bookingMap(Booking b) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", b.getId());
        m.put("seats", b.getSeats());
        m.put("status", b.getStatus());
        m.put("guestNote", b.getGuestNote());
        m.put("createdAt", b.getCreatedAt());
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("name", str(b.getUser().getName()));
        userMap.put("email", b.getUser().getEmail());
        m.put("user", userMap);
        Map<String, Object> expMap = new HashMap<>();
        expMap.put("title", b.getExperience().getTitle());
        expMap.put("emoji", str(b.getExperience().getEmoji()));
        expMap.put("city", b.getExperience().getCity());
        m.put("experience", expMap);
        return m;
    }

    private Map<String, Object> reviewMap(Review r) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", r.getId());
        m.put("rating", r.getRating());
        m.put("body", str(r.getBody()));
        m.put("reply", r.getReply());
        m.put("createdAt", r.getCreatedAt());
        Map<String, Object> authorMap = new HashMap<>();
        authorMap.put("name", str(r.getAuthor().getName()));
        authorMap.put("email", r.getAuthor().getEmail());
        m.put("author", authorMap);
        if (r.getTarget() != null) {
            Map<String, Object> targetMap = new HashMap<>();
            targetMap.put("name", str(r.getTarget().getName()));
            targetMap.put("email", r.getTarget().getEmail());
            m.put("target", targetMap);
        } else {
            m.put("target", null);
        }
        if (r.getExperience() != null) {
            Map<String, Object> expMap = new HashMap<>();
            expMap.put("title", r.getExperience().getTitle());
            expMap.put("emoji", str(r.getExperience().getEmoji()));
            m.put("experience", expMap);
        } else {
            m.put("experience", null);
        }
        return m;
    }
}
