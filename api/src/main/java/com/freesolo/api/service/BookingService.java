package com.freesolo.api.service;

import com.freesolo.api.dto.booking.BookingResponse;
import com.freesolo.api.dto.common.PageResponse;
import com.freesolo.api.dto.experience.BookExperienceRequest;
import com.freesolo.api.entity.*;
import com.freesolo.api.exception.ApiException;
import com.freesolo.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ExperienceRepository experienceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

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

    @Transactional
    public BookingResponse createBooking(String userId, String experienceId, BookExperienceRequest req) {
        Experience exp = experienceRepository.findById(experienceId)
                .orElseThrow(() -> ApiException.notFound("Experience not found"));

        if (!"active".equals(exp.getStatus())) {
            throw ApiException.badRequest("Experience is not available for booking");
        }

        long filledSeats = bookingRepository.countFilledSeats(exp);
        if (filledSeats + req.seats() > exp.getMaxSeats()) {
            throw ApiException.badRequest("Not enough seats available");
        }

        User user = userRepository.findById(userId).orElseThrow();

        var split = calcSplit(exp.getPrice(), req.seats());

        Booking booking = Booking.builder()
                .user(user)
                .experience(exp)
                .seats(req.seats())
                .amountTotal(split.total())
                .amountVenue(split.venue())
                .amountHostCredit(split.credit())
                .amountPlatform(split.platform())
                .currency(exp.getCurrency())
                .guestNote(req.guestNote())
                .build();

        return BookingResponse.from(bookingRepository.save(booking));
    }

    @Transactional
    public void cancelBooking(String bookingId, String userId, String reason) {
        Booking b = bookingRepository.findById(bookingId)
                .orElseThrow(() -> ApiException.notFound("Booking not found"));

        if (!b.getUser().getId().equals(userId)) {
            throw ApiException.forbidden("Access denied");
        }
        if (List.of("cancelled", "completed", "refunded").contains(b.getStatus())) {
            throw ApiException.badRequest("Booking cannot be cancelled");
        }

        b.setStatus("cancelled");
        b.setCancelReason(reason);
        b.setCancelledAt(java.time.LocalDateTime.now());
        bookingRepository.save(b);
    }

    private record SplitResult(double total, double venue, double credit, double platform) {}

    private SplitResult calcSplit(double price, int seats) {
        double total    = price * seats;
        double venue    = round(total * 0.70);
        double credit   = round(total * 0.10);
        double platform = round(total * 0.20);
        return new SplitResult(total, venue, credit, platform);
    }

    private double round(double v) { return Math.round(v * 100.0) / 100.0; }
}
