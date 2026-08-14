package com.freesolo.api.controller;

import com.freesolo.api.dto.booking.BookingResponse;
import com.freesolo.api.dto.booking.CancelBookingRequest;
import com.freesolo.api.dto.common.PageResponse;
import com.freesolo.api.security.UserPrincipal;
import com.freesolo.api.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    /** GET /api/bookings */
    @GetMapping
    public ResponseEntity<PageResponse<BookingResponse>> list(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(bookingService.getMyBookings(principal.getId(), page, Math.min(50, limit)));
    }

    /** GET /api/bookings/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getById(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(bookingService.getById(id, principal.getId()));
    }

    /** POST /api/bookings/{id}/cancel */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<Map<String, String>> cancel(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody(required = false) CancelBookingRequest req) {
        bookingService.cancelBooking(id, principal.getId(), req != null ? req.reason() : null);
        return ResponseEntity.ok(Map.of("message", "Booking cancelled"));
    }
}
