package com.freesolo.api.controller;

import com.freesolo.api.dto.stripe.PaymentIntentRequest;
import com.freesolo.api.dto.stripe.SetupIntentRequest;
import com.freesolo.api.entity.*;
import com.freesolo.api.exception.ApiException;
import com.freesolo.api.repository.*;
import com.freesolo.api.security.UserPrincipal;
import com.freesolo.api.service.*;
import com.stripe.model.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stripe")
@RequiredArgsConstructor
@Slf4j
public class StripeController {

    private final StripeService stripeService;
    private final UserService userService;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final BookingRepository bookingRepository;
    private final ExperienceRepository experienceRepository;
    private final UserRepository userRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final BusinessRepository businessRepository;
    private final PayoutRepository payoutRepository;

    /** POST /api/stripe/payment-intent */
    @PostMapping("/payment-intent")
    @Transactional
    public ResponseEntity<Map<String, Object>> createPaymentIntent(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PaymentIntentRequest req) {

        User user = userService.getById(principal.getId());
        Booking booking = bookingRepository.findById(req.bookingId())
                .orElseThrow(() -> ApiException.notFound("Booking not found"));

        if (!booking.getUser().getId().equals(user.getId())) throw ApiException.forbidden("Access denied");

        String customerId = stripeService.ensureCustomer(user);
        if (!customerId.equals(user.getStripeCustomerId())) {
            user.setStripeCustomerId(customerId);
            userRepository.save(user);
        }

        PaymentIntent pi = stripeService.createPaymentIntent(booking, customerId, req.paymentMethodId());
        booking.setStripePaymentIntentId(pi.getId());
        bookingRepository.save(booking);

        return ResponseEntity.ok(Map.of("clientSecret", pi.getClientSecret(), "paymentIntentId", pi.getId()));
    }

    /** POST /api/stripe/setup-intent */
    @PostMapping("/setup-intent")
    public ResponseEntity<Map<String, String>> createSetupIntent(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody(required = false) SetupIntentRequest req) {

        User user = userService.getById(principal.getId());
        String customerId = stripeService.ensureCustomer(user);
        if (!customerId.equals(user.getStripeCustomerId())) {
            user.setStripeCustomerId(customerId);
            userRepository.save(user);
        }

        SetupIntent si = stripeService.createSetupIntent(customerId);
        return ResponseEntity.ok(Map.of("clientSecret", si.getClientSecret()));
    }

    /** POST /api/stripe/connect — create Stripe Connect account for host */
    @PostMapping("/connect")
    @Transactional
    public ResponseEntity<Map<String, String>> connectAccount(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String businessId) {

        User user = userService.getById(principal.getId());
        Business biz;

        if (businessId != null) {
            biz = businessRepository.findById(businessId)
                    .orElseThrow(() -> ApiException.notFound("Business not found"));
            if (!biz.getOwner().getId().equals(user.getId())) throw ApiException.forbidden("Access denied");
        } else {
            biz = businessRepository.findFirstByOwnerOrderByCreatedAtAsc(user)
                    .orElseThrow(() -> ApiException.notFound("No business found for this user"));
        }

        if (biz.getStripeAccountId() != null) {
            return ResponseEntity.ok(Map.of("accountId", biz.getStripeAccountId(), "message", "Already connected"));
        }

        Account account = stripeService.createConnectAccount(user.getEmail());
        biz.setStripeAccountId(account.getId());
        businessRepository.save(biz);

        return ResponseEntity.ok(Map.of("accountId", account.getId(), "message", "Stripe Connect account created"));
    }

    /** POST /api/stripe/webhook */
    @PostMapping("/webhook")
    @Transactional
    public ResponseEntity<Map<String, Boolean>> webhook(HttpServletRequest request,
                                                         @RequestHeader("Stripe-Signature") String sig)
            throws IOException {
        String payload = StreamUtils.copyToString(request.getInputStream(), StandardCharsets.UTF_8);
        Event event = stripeService.constructWebhookEvent(payload, sig);

        if ("payment_intent.succeeded".equals(event.getType())) {
            handlePaymentSucceeded(event);
        } else if ("payment_intent.payment_failed".equals(event.getType())) {
            handlePaymentFailed(event);
        }

        return ResponseEntity.ok(Map.of("received", true));
    }

    @SuppressWarnings("unchecked")
    private void handlePaymentSucceeded(Event event) {
        var pi = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
        if (pi == null) return;

        Booking booking = bookingRepository.findByStripePaymentIntentId(pi.getId()).orElse(null);
        if (booking == null) return;

        booking.setStripeChargeId(pi.getLatestCharge());
        booking.setStripePaidAt(LocalDateTime.now());
        bookingRepository.save(booking);

        Experience exp = booking.getExperience();
        long filledSeats = bookingRepository.countFilledSeats(exp);
        boolean confirmed = filledSeats >= exp.getMinSeats();

        if (confirmed) {
            List<Booking> pending = bookingRepository.findByExperienceAndStatus(exp, "pending");
            for (Booking b : pending) {
                b.setStatus("confirmed");
                b.setConfirmedAt(LocalDateTime.now());
                bookingRepository.save(b);

                notificationService.create(b.getUser().getId(), "booking_confirmed",
                        "Booking confirmed! 🎉",
                        "Your seat for \"" + exp.getTitle() + "\" is confirmed.",
                        Map.of("bookingId", b.getId(), "experienceId", exp.getId()));
                emailService.sendBookingConfirmed(b.getUser().getEmail(), exp.getTitle(), exp.getDate());
            }

            // Create payout for host
            if (booking.getPayout() == null) {
                com.freesolo.api.entity.Payout payout = com.freesolo.api.entity.Payout.builder()
                        .booking(booking)
                        .host(exp.getHost())
                        .amount(booking.getAmountVenue())
                        .currency(booking.getCurrency())
                        .build();
                payoutRepository.save(payout);
            }
        } else {
            long needed = exp.getMinSeats() - filledSeats;
            notificationService.create(booking.getUser().getId(), "booking_pending",
                    "Seat reserved",
                    "Waiting for " + needed + " more traveler" + (needed != 1 ? "s" : "") +
                    " to confirm \"" + exp.getTitle() + "\".",
                    Map.of("bookingId", booking.getId(), "experienceId", exp.getId()));
            emailService.sendBookingPending(booking.getUser().getEmail(), exp.getTitle(), (int) needed);
        }
    }

    private void handlePaymentFailed(Event event) {
        var pi = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
        if (pi == null) return;

        bookingRepository.findByStripePaymentIntentId(pi.getId()).ifPresent(booking -> {
            booking.setStatus("cancelled");
            booking.setCancelReason("payment_failed");
            booking.setCancelledAt(LocalDateTime.now());
            bookingRepository.save(booking);
        });
    }
}
