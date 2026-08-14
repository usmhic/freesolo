package com.freesolo.api.service;

import com.freesolo.api.config.AppProperties;
import com.freesolo.api.dto.admin.AdminUpdateUserRequest;
import com.freesolo.api.dto.admin.CampaignRequest;
import com.freesolo.api.entity.*;
import com.freesolo.api.exception.ApiException;
import com.freesolo.api.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final ExperienceRepository experienceRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final PayoutRepository payoutRepository;
    private final UploadRepository uploadRepository;
    private final EventPhotoRepository eventPhotoRepository;
    private final EmailCampaignRepository emailCampaignRepository;
    private final ApplicationRepository applicationRepository;
    private final NotificationService notificationService;
    private final StripeService stripeService;
    private final EmailService emailService;
    private final StorageService storageService;

    // ── Users ────────────────────────────────────────────────────────────────

    private static final List<String> VALID_ROLES    = List.of("traveler", "business", "admin");
    private static final List<String> VALID_STATUSES = List.of("pending", "approved", "rejected", "suspended");

    @Transactional
    public void setUserRole(String userId, String role, String currentAdminId) {
        if (!VALID_ROLES.contains(role)) throw ApiException.badRequest("Invalid role");
        if (userId.equals(currentAdminId) && !"admin".equals(role))
            throw ApiException.badRequest("You can't remove your own admin role");
        User user = userRepository.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));
        user.setRole(role);
        userRepository.save(user);
    }

    @Transactional
    public void setUserStatus(String userId, String status, String currentAdminId) {
        if (!VALID_STATUSES.contains(status)) throw ApiException.badRequest("Invalid status");
        if (userId.equals(currentAdminId)) throw ApiException.badRequest("You can't change your own status");
        User user = userRepository.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));
        user.setStatus(status);
        userRepository.save(user);
    }

    @Transactional
    public void updateUser(String userId, AdminUpdateUserRequest req) {
        User user = userRepository.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));
        if (!user.getEmail().equals(req.email()) && userRepository.existsByEmail(req.email()))
            throw ApiException.conflict("Email already in use");
        user.setName(req.name().trim());
        user.setEmail(req.email().trim());
        user.setPhone(req.phone() != null && !req.phone().isBlank() ? req.phone().trim() : null);
        user.setBio(req.bio() != null && !req.bio().isBlank() ? req.bio().trim() : null);
        user.setTravelCredits(req.travelCredits());
        user.setCountriesVisited(req.countriesVisited());
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(String userId, String currentAdminId) {
        if (userId.equals(currentAdminId)) throw ApiException.badRequest("You can't delete your own account");
        User user = userRepository.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));
        long related = user.getBookings().size() + user.getExperiences().size() + user.getBusinesses().size();
        if (related > 0) throw ApiException.badRequest("User has related records. Suspend instead.");
        userRepository.delete(user);
    }

    @Transactional
    public void sendUserNotification(String userId, String title, String body) {
        notificationService.create(userId, "admin_message", title, body, null);
    }

    // ── Businesses ──────────────────────────────────────────────────────────

    private static final List<String> VALID_BIZ_STATUSES = List.of("pending", "approved", "rejected", "suspended");

    @Transactional
    public void setBusinessStatus(String businessId, String status) {
        if (!VALID_BIZ_STATUSES.contains(status)) throw ApiException.badRequest("Invalid status");
        Business biz = businessRepository.findById(businessId)
                .orElseThrow(() -> ApiException.notFound("Business not found"));
        biz.setStatus(status);
        businessRepository.save(biz);

        // Graduate owner to business role on approval
        if ("approved".equals(status) && "traveler".equals(biz.getOwner().getRole())) {
            User owner = biz.getOwner();
            owner.setRole("business");
            userRepository.save(owner);
        }

        Map<String, String> messages = Map.of(
                "approved", "Your business was approved ✅",
                "rejected", "Update on your business listing",
                "suspended", "Your business was suspended"
        );
        if (messages.containsKey(status)) {
            notificationService.create(biz.getOwner().getId(), "business_status",
                    messages.get(status), biz.getName(), null);
        }
    }

    @Transactional
    public void deleteBusiness(String businessId) {
        Business biz = businessRepository.findById(businessId)
                .orElseThrow(() -> ApiException.notFound("Business not found"));
        if (!biz.getExperiences().isEmpty())
            throw ApiException.badRequest("Business has experiences. Suspend instead.");
        businessRepository.delete(biz);
    }

    // ── Experiences ─────────────────────────────────────────────────────────

    private static final List<String> VALID_EXP_STATUSES = List.of("active", "suspended", "completed");

    @Transactional
    public void setExperienceStatus(String experienceId, String status) {
        if (!VALID_EXP_STATUSES.contains(status)) throw ApiException.badRequest("Invalid status");
        Experience exp = experienceRepository.findById(experienceId)
                .orElseThrow(() -> ApiException.notFound("Experience not found"));
        exp.setStatus(status);
        experienceRepository.save(exp);

        if ("suspended".equals(status)) {
            notificationService.create(exp.getHost().getId(), "experience_status",
                    "An experience was suspended",
                    "\"" + exp.getTitle() + "\" has been suspended.", null);
        }
    }

    @Transactional
    public void setExperienceFeatured(String experienceId, boolean featured) {
        Experience exp = experienceRepository.findById(experienceId)
                .orElseThrow(() -> ApiException.notFound("Experience not found"));
        exp.setFeatured(featured);
        experienceRepository.save(exp);
    }

    @Transactional
    public void markExperienceCompleted(String experienceId) {
        Experience exp = experienceRepository.findById(experienceId)
                .orElseThrow(() -> ApiException.notFound("Experience not found"));
        if ("completed".equals(exp.getStatus()))
            throw ApiException.badRequest("Experience is already completed");

        List<Booking> confirmed = bookingRepository.findByExperienceAndStatus(exp, "confirmed");
        LocalDateTime now = LocalDateTime.now();

        confirmed.forEach(b -> {
            b.setStatus("completed");
            b.setCompletedAt(now);
            bookingRepository.save(b);
            notificationService.create(b.getUser().getId(), "experience_completed",
                    "How was it? 🏁",
                    "\"" + exp.getTitle() + "\" is complete — rate it and share photos.",
                    Map.of("experienceId", exp.getId(), "bookingId", b.getId()));
        });

        exp.setStatus("completed");
        experienceRepository.save(exp);
    }

    @Transactional
    public void deleteExperience(String experienceId) {
        Experience exp = experienceRepository.findById(experienceId)
                .orElseThrow(() -> ApiException.notFound("Experience not found"));
        if (!exp.getBookings().isEmpty())
            throw ApiException.badRequest("Experience has bookings. Suspend instead.");
        experienceRepository.delete(exp);
    }

    // ── Bookings ─────────────────────────────────────────────────────────────

    private static final List<String> VALID_BOOKING_STATUSES =
            List.of("pending", "confirmed", "completed", "cancelled", "refunded");

    @Transactional
    public void updateBookingStatus(String bookingId, String status, int seats, String guestNote) {
        if (!VALID_BOOKING_STATUSES.contains(status)) throw ApiException.badRequest("Invalid status");
        Booking b = bookingRepository.findById(bookingId).orElseThrow(() -> ApiException.notFound("Booking not found"));
        b.setStatus(status);
        b.setSeats(seats);
        b.setGuestNote(guestNote != null && !guestNote.isBlank() ? guestNote : null);
        bookingRepository.save(b);
    }

    @Transactional
    public void deleteBooking(String bookingId) {
        Booking b = bookingRepository.findById(bookingId).orElseThrow(() -> ApiException.notFound("Booking not found"));
        if (b.getReview() != null || b.getPayout() != null)
            throw ApiException.badRequest("Booking has linked records. Cancel instead.");
        bookingRepository.delete(b);
    }

    // ── Reviews ─────────────────────────────────────────────────────────────

    @Transactional
    public void updateReview(String reviewId, int rating, String body, String reply) {
        if (rating < 1 || rating > 5) throw ApiException.badRequest("Rating must be 1-5");
        Review r = reviewRepository.findById(reviewId).orElseThrow(() -> ApiException.notFound("Review not found"));
        r.setRating(rating);
        if (body != null && !body.isBlank()) r.setBody(body);
        r.setReply(reply != null && !reply.isBlank() ? reply : null);
        reviewRepository.save(r);
    }

    @Transactional
    public void deleteReview(String reviewId) {
        Review r = reviewRepository.findById(reviewId).orElseThrow(() -> ApiException.notFound("Review not found"));
        reviewRepository.delete(r);
    }

    // ── Payouts ──────────────────────────────────────────────────────────────

    @Transactional
    public void processPayout(String payoutId) {
        Payout payout = payoutRepository.findById(payoutId)
                .orElseThrow(() -> ApiException.notFound("Payout not found"));
        if (!"pending".equals(payout.getStatus())) throw ApiException.badRequest("Payout already processed");

        String stripeAccountId = payout.getHost().getBusinesses().stream()
                .map(Business::getStripeAccountId).filter(id -> id != null).findFirst()
                .orElseThrow(() -> ApiException.badRequest("Host has no connected Stripe account"));

        var transfer = stripeService.createTransfer(
                Math.round(payout.getAmount() * 100), payout.getCurrency(), stripeAccountId,
                Map.of("payoutId", payoutId));

        payout.setStatus("paid");
        payout.setStripeTransferId(transfer.getId());
        payout.setPaidAt(LocalDateTime.now());
        payoutRepository.save(payout);

        notificationService.create(payout.getHost().getId(), "payout_paid",
                "You got paid! 💸",
                "A payout of " + payout.getAmount() + " " + payout.getCurrency() + " was sent.", null);
    }

    // ── Business full update ─────────────────────────────────────────────────

    @Transactional
    public void updateBusiness(String businessId, String name, String type, String address,
                                String city, String country, String description, String website) {
        Business biz = businessRepository.findById(businessId)
                .orElseThrow(() -> ApiException.notFound("Business not found"));
        if (name != null && !name.isBlank()) biz.setName(name.trim());
        if (type != null && !type.isBlank()) biz.setType(type.trim());
        if (address != null) biz.setAddress(address.trim());
        if (city != null && !city.isBlank()) biz.setCity(city.trim());
        if (country != null && !country.isBlank()) biz.setCountry(country.trim());
        if (description != null) biz.setDescription(description.trim());
        if (website != null) biz.setWebsite(website.trim());
        businessRepository.save(biz);
    }

    // ── Experience full update ───────────────────────────────────────────────

    @Transactional
    public void updateExperience(String experienceId, java.util.Map<String, Object> fields) {
        Experience exp = experienceRepository.findById(experienceId)
                .orElseThrow(() -> ApiException.notFound("Experience not found"));
        if (fields.containsKey("title")) exp.setTitle((String) fields.get("title"));
        if (fields.containsKey("description")) exp.setDescription((String) fields.get("description"));
        if (fields.containsKey("category")) exp.setCategory((String) fields.get("category"));
        if (fields.containsKey("emoji")) exp.setEmoji((String) fields.get("emoji"));
        if (fields.containsKey("city")) exp.setCity((String) fields.get("city"));
        if (fields.containsKey("country")) exp.setCountry((String) fields.get("country"));
        if (fields.containsKey("date")) exp.setDate((String) fields.get("date"));
        if (fields.containsKey("time")) exp.setTime((String) fields.get("time"));
        if (fields.containsKey("durationMins")) exp.setDurationMins(((Number) fields.get("durationMins")).intValue());
        if (fields.containsKey("minSeats")) exp.setMinSeats(((Number) fields.get("minSeats")).intValue());
        if (fields.containsKey("maxSeats")) exp.setMaxSeats(((Number) fields.get("maxSeats")).intValue());
        if (fields.containsKey("price")) exp.setPrice(((Number) fields.get("price")).doubleValue());
        experienceRepository.save(exp);
    }

    // ── Application update + delete ──────────────────────────────────────────

    @Transactional
    public void updateApplication(String applicationId, String story, String reviewNote) {
        com.freesolo.api.entity.Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> ApiException.notFound("Application not found"));
        if (story != null && !story.isBlank()) app.setStory(story.trim());
        if (reviewNote != null) app.setReviewNote(reviewNote.trim());
        applicationRepository.save(app);
    }

    @Transactional
    public void deleteApplication(String applicationId) {
        applicationRepository.findById(applicationId).ifPresentOrElse(
                applicationRepository::delete,
                () -> { throw ApiException.notFound("Application not found"); }
        );
    }

    // ── Media ────────────────────────────────────────────────────────────────

    @Transactional
    public void deleteUpload(String uploadId) {
        Upload upload = uploadRepository.findById(uploadId)
                .orElseThrow(() -> ApiException.notFound("Upload not found"));
        storageService.delete(upload.getKey());
        uploadRepository.delete(upload);
    }

    @Transactional
    public void deleteEventPhoto(String photoId) {
        EventPhoto photo = eventPhotoRepository.findById(photoId)
                .orElseThrow(() -> ApiException.notFound("Photo not found"));
        storageService.delete(photo.getKey());
        eventPhotoRepository.delete(photo);
    }

    // ── Campaigns ────────────────────────────────────────────────────────────

    @Transactional
    public EmailCampaign createCampaign(CampaignRequest req, String adminId) {
        User admin = userRepository.findById(adminId).orElseThrow();
        EmailCampaign campaign = EmailCampaign.builder()
                .title(req.title().trim())
                .subject(req.subject().trim())
                .body(req.body())
                .segment(req.segment())
                .createdBy(admin)
                .build();

        if (req.scheduledAt() != null && !req.scheduledAt().isBlank()) {
            LocalDateTime scheduled = LocalDateTime.parse(req.scheduledAt());
            if (scheduled.isBefore(LocalDateTime.now())) throw ApiException.badRequest("Scheduled time must be in the future");
            campaign.setScheduledAt(scheduled);
            campaign.setStatus("scheduled");
        }

        return emailCampaignRepository.save(campaign);
    }

    @Transactional
    public EmailCampaign updateCampaign(String campaignId, CampaignRequest req) {
        EmailCampaign campaign = emailCampaignRepository.findById(campaignId)
                .orElseThrow(() -> ApiException.notFound("Campaign not found"));
        if (!List.of("draft", "scheduled").contains(campaign.getStatus()))
            throw ApiException.badRequest("Only draft or scheduled campaigns can be edited");

        campaign.setTitle(req.title().trim());
        campaign.setSubject(req.subject().trim());
        campaign.setBody(req.body());
        campaign.setSegment(req.segment());

        if (req.scheduledAt() != null && !req.scheduledAt().isBlank()) {
            campaign.setScheduledAt(LocalDateTime.parse(req.scheduledAt()));
            campaign.setStatus("scheduled");
        } else {
            campaign.setScheduledAt(null);
            campaign.setStatus("draft");
        }

        return emailCampaignRepository.save(campaign);
    }

    @Transactional
    public void deleteCampaign(String campaignId) {
        EmailCampaign c = emailCampaignRepository.findById(campaignId)
                .orElseThrow(() -> ApiException.notFound("Campaign not found"));
        if ("sending".equals(c.getStatus())) throw ApiException.badRequest("Campaign is currently sending");
        emailCampaignRepository.delete(c);
    }

    @Transactional
    public void sendCampaign(String campaignId) {
        EmailCampaign campaign = emailCampaignRepository.findById(campaignId)
                .orElseThrow(() -> ApiException.notFound("Campaign not found"));
        if (List.of("sent", "sending").contains(campaign.getStatus()))
            throw ApiException.badRequest("Campaign was already sent");

        campaign.setStatus("sending");
        emailCampaignRepository.save(campaign);

        List<User> recipients = getSegment(campaign.getSegment());
        for (User user : recipients) {
            try {
                emailService.sendMarketingCampaign(user.getEmail(), campaign.getSubject(),
                        campaign.getBody(), "/api/unsubscribe?email=" + user.getEmail());
            } catch (Exception e) {
                log.warn("Failed to send campaign to {}: {}", user.getEmail(), e.getMessage());
            }
        }

        campaign.setStatus("sent");
        campaign.setSentAt(LocalDateTime.now());
        campaign.setRecipientCount(recipients.size());
        emailCampaignRepository.save(campaign);
    }

    private List<User> getSegment(String segment) {
        return switch (segment) {
            case "travelers"  -> userRepository.findApprovedByRole("traveler");
            case "hosts"      -> userRepository.findApprovedByRole("business");
            case "admins"     -> userRepository.findApprovedByRole("admin");
            default           -> userRepository.findByMarketingOptInTrue();
        };
    }

    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void processDueCampaigns() {
        List<EmailCampaign> due = emailCampaignRepository
                .findByStatusAndScheduledAtBefore("scheduled", LocalDateTime.now());
        for (EmailCampaign c : due) {
            try { sendCampaign(c.getId()); }
            catch (Exception e) { log.error("Failed to send scheduled campaign {}: {}", c.getId(), e.getMessage()); }
        }
    }

    // ── Dashboard stats ──────────────────────────────────────────────────────
}
