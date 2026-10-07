package com.freesolo.api.service;

import com.freesolo.api.dto.booking.BookingResponse;
import com.freesolo.api.dto.common.PageResponse;
import com.freesolo.api.dto.experience.BookExperienceRequest;
import com.freesolo.api.dto.hosting.JoinRequestResponse;
import com.freesolo.api.entity.*;
import com.freesolo.api.exception.ApiException;
import com.freesolo.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BookingService {

    /** A traveler can hold at most one of these on a listing at a time. */
    private static final List<String> OPEN_STATUSES =
            List.of(Booking.REQUESTED, Booking.PENDING, Booking.CONFIRMED);
    /** Open bookings plus a host's decline, which a traveler cannot re-request around. */
    private static final List<String> REJOIN_BLOCKING_STATUSES =
            List.of(Booking.REQUESTED, Booking.PENDING, Booking.CONFIRMED, Booking.DECLINED);

    private final BookingRepository bookingRepository;
    private final ExperienceRepository experienceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public PageResponse<BookingResponse> getMyBookings(String userId, int page, int limit) {
        User user = userRepository.findById(userId).orElseThrow();
        Page<Booking> result = bookingRepository.findByUser(
                user, PageRequest.of(page - 1, limit, Sort.by("createdAt").descending()));
        List<BookingResponse> responses = result.getContent().stream().map(BookingResponse::from).toList();
        return PageResponse.of(responses, result.getTotalElements(), page, limit);
    }

    public BookingResponse getById(String bookingId, String userId) {
        Booking b = bookingRepository.findById(bookingId)
                .orElseThrow(() -> ApiException.notFound("Booking not found"));
        if (!b.getUser().getId().equals(userId)) {
            throw ApiException.forbidden("Access denied");
        }
        return BookingResponse.from(b);
    }

    /**
     * Reserves a seat, or — on listings where the host vets the group — files a
     * join request that holds no seat until the host accepts it.
     */
    @Transactional
    public BookingResponse createBooking(String userId, String experienceId, BookExperienceRequest req) {
        User user = userRepository.findById(userId).orElseThrow();
        if (!"approved".equals(user.getStatus())) {
            throw ApiException.forbidden("Only approved FreeSolo members can join");
        }

        Experience exp = experienceRepository.findByIdForUpdate(experienceId)
                .orElseThrow(() -> ApiException.notFound("Experience not found"));

        if (!"active".equals(exp.getStatus())) {
            throw ApiException.badRequest("Experience is not available for booking");
        }
        if (exp.getHost().getId().equals(userId)) {
            throw ApiException.badRequest("You're hosting this one");
        }
        if (exp.isTrip() && req.seats() != 1) {
            throw ApiException.badRequest("Trips are joined one traveler at a time");
        }
        if (bookingRepository.existsByUserAndExperienceAndStatusIn(user, exp, REJOIN_BLOCKING_STATUSES)) {
            throw ApiException.conflict("You've already joined or asked to join this one");
        }

        long filledSeats = bookingRepository.countFilledSeats(exp);
        if (filledSeats + req.seats() > exp.getMaxSeats()) {
            throw ApiException.badRequest("Not enough seats available");
        }

        boolean needsApproval = exp.requiresApproval();
        Booking booking = bookingRepository.save(Booking.builder()
                .user(user)
                .experience(exp)
                .seats(req.seats())
                .guestNote(req.guestNote())
                .status(needsApproval ? Booking.REQUESTED : Booking.PENDING)
                .build());

        String traveler = displayName(user);
        if (needsApproval) {
            notificationService.create(exp.getHost().getId(), "join_request",
                    "New request to join ✋",
                    traveler + " would like to join \"" + exp.getTitle() + "\".",
                    Map.of("experienceId", exp.getId(), "bookingId", booking.getId()));
        } else {
            notificationService.create(exp.getHost().getId(), "booking_new",
                    "Someone joined 🙌",
                    traveler + " reserved a seat on \"" + exp.getTitle() + "\".",
                    Map.of("experienceId", exp.getId(), "bookingId", booking.getId()));
            confirmIfGroupReady(exp);
        }

        return BookingResponse.from(booking);
    }

    @Transactional
    public void cancelBooking(String bookingId, String userId, String reason) {
        Booking b = bookingRepository.findById(bookingId)
                .orElseThrow(() -> ApiException.notFound("Booking not found"));

        if (!b.getUser().getId().equals(userId)) {
            throw ApiException.forbidden("Access denied");
        }
        if (!OPEN_STATUSES.contains(b.getStatus())) {
            throw ApiException.badRequest("Booking cannot be cancelled");
        }

        b.setStatus(Booking.CANCELLED);
        b.setCancelReason(reason);
        b.setCancelledAt(LocalDateTime.now());
        bookingRepository.save(b);
    }

    // ── Host side ────────────────────────────────────────────────────────────

    public List<JoinRequestResponse> getJoinRequests(String hostId, String experienceId) {
        Experience exp = experienceRepository.findById(experienceId)
                .orElseThrow(() -> ApiException.notFound("Experience not found"));
        requireHost(exp, hostId);
        return bookingRepository.findByExperienceAndStatusInOrderByCreatedAtAsc(
                        exp, List.of(Booking.REQUESTED, Booking.PENDING, Booking.CONFIRMED))
                .stream().map(JoinRequestResponse::from).toList();
    }

    @Transactional
    public JoinRequestResponse approveJoinRequest(String hostId, String bookingId, String note) {
        Booking b = bookingRepository.findById(bookingId)
                .orElseThrow(() -> ApiException.notFound("Request not found"));
        // Lock before counting seats so two approvals cannot both take the last one.
        Experience exp = experienceRepository.findByIdForUpdate(b.getExperience().getId()).orElseThrow();
        requireHost(exp, hostId);
        requireRequested(b);

        if (bookingRepository.countFilledSeats(exp) + b.getSeats() > exp.getMaxSeats()) {
            throw ApiException.badRequest("The group is full — decline or free up a seat first");
        }

        b.setStatus(Booking.PENDING);
        b.setDecidedAt(LocalDateTime.now());
        bookingRepository.save(b);

        notificationService.create(b.getUser().getId(), "join_approved",
                "You're in the group ✅",
                withNote(displayName(exp.getHost()) + " accepted you on \"" + exp.getTitle() + "\".", note),
                Map.of("experienceId", exp.getId(), "bookingId", b.getId()));

        confirmIfGroupReady(exp);
        return JoinRequestResponse.from(b);
    }

    @Transactional
    public JoinRequestResponse declineJoinRequest(String hostId, String bookingId, String note) {
        Booking b = bookingRepository.findById(bookingId)
                .orElseThrow(() -> ApiException.notFound("Request not found"));
        Experience exp = b.getExperience();
        requireHost(exp, hostId);
        requireRequested(b);

        b.setStatus(Booking.DECLINED);
        b.setDecidedAt(LocalDateTime.now());
        b.setCancelReason(note != null && !note.isBlank() ? note.trim() : null);
        bookingRepository.save(b);

        notificationService.create(b.getUser().getId(), "join_declined",
                "Update on your request",
                withNote("The host of \"" + exp.getTitle() + "\" has filled the group a different way this time.", note),
                Map.of("experienceId", exp.getId(), "bookingId", b.getId()));

        return JoinRequestResponse.from(b);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Once the seats held reach the listing's minimum, every pending seat
     * confirms at once — the group is happening.
     */
    private void confirmIfGroupReady(Experience exp) {
        if (bookingRepository.countFilledSeats(exp) < exp.getMinSeats()) return;

        LocalDateTime now = LocalDateTime.now();
        for (Booking b : bookingRepository.findByExperienceAndStatus(exp, Booking.PENDING)) {
            b.setStatus(Booking.CONFIRMED);
            b.setConfirmedAt(now);
            bookingRepository.save(b);
            notificationService.create(b.getUser().getId(), "booking_confirmed",
                    "You're in! 🎒",
                    "\"" + exp.getTitle() + "\" has enough travelers — it's happening.",
                    Map.of("experienceId", exp.getId(), "bookingId", b.getId()));
            emailService.sendBookingConfirmed(b.getUser().getEmail(), exp.getTitle(), exp.getDate());
        }
    }

    private static void requireHost(Experience exp, String userId) {
        if (!exp.getHost().getId().equals(userId)) {
            throw ApiException.forbidden("Only the host can manage this group");
        }
    }

    private static void requireRequested(Booking b) {
        if (!Booking.REQUESTED.equals(b.getStatus())) {
            throw ApiException.badRequest("This request has already been answered");
        }
    }

    private static String displayName(User u) {
        return u.getName() != null && !u.getName().isBlank() ? u.getName() : "A FreeSolo member";
    }

    private static String withNote(String body, String note) {
        return note != null && !note.isBlank() ? body + " \"" + note.trim() + "\"" : body;
    }
}
