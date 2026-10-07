package com.freesolo.api.service;

import com.freesolo.api.dto.experience.BookExperienceRequest;
import com.freesolo.api.entity.Booking;
import com.freesolo.api.entity.Experience;
import com.freesolo.api.entity.User;
import com.freesolo.api.exception.ApiException;
import com.freesolo.api.repository.BookingRepository;
import com.freesolo.api.repository.ExperienceRepository;
import com.freesolo.api.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock BookingRepository bookingRepository;
    @Mock ExperienceRepository experienceRepository;
    @Mock UserRepository userRepository;
    @Mock NotificationService notificationService;
    @Mock EmailService emailService;

    @InjectMocks BookingService bookingService;

    User host;
    User traveler;
    Experience trip;

    @BeforeEach
    void setUp() {
        host = User.builder().id("host").name("Hana").status("approved").build();
        traveler = User.builder().id("ana").name("Ana").email("ana@x.test").status("approved").build();
        trip = Experience.builder()
                .id("trip").kind(Experience.KIND_TRIP).joinPolicy(Experience.JOIN_APPROVAL)
                .host(host).title("Azores island hop").date("2026-11-10")
                .minSeats(2).maxSeats(6).status("active")
                .build();
        lenient().when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> {
            Booking b = inv.getArgument(0);
            if (b.getId() == null) b.setId("new-booking");
            return b;
        });
    }

    @Test
    void joiningAnApprovalTripFilesARequestThatHoldsNoSeat() {
        when(userRepository.findById("ana")).thenReturn(Optional.of(traveler));
        when(experienceRepository.findByIdForUpdate("trip")).thenReturn(Optional.of(trip));

        var response = bookingService.createBooking("ana", "trip", new BookExperienceRequest(1, "Hi!"));

        assertThat(response.status()).isEqualTo(Booking.REQUESTED);
        verify(notificationService).create(eq("host"), eq("join_request"), any(), any(), any());
        verify(bookingRepository, never()).findByExperienceAndStatus(any(), any());
    }

    @Test
    void membersWhoAreNotApprovedCannotJoin() {
        traveler.setStatus("pending");
        when(userRepository.findById("ana")).thenReturn(Optional.of(traveler));

        assertThatThrownBy(() -> bookingService.createBooking("ana", "trip", new BookExperienceRequest(1, null)))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("approved");
    }

    @Test
    void tripsAreJoinedOneTravelerAtATime() {
        when(userRepository.findById("ana")).thenReturn(Optional.of(traveler));
        when(experienceRepository.findByIdForUpdate("trip")).thenReturn(Optional.of(trip));

        assertThatThrownBy(() -> bookingService.createBooking("ana", "trip", new BookExperienceRequest(2, null)))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("one traveler");
    }

    @Test
    void aDeclinedTravelerCannotRequestAgain() {
        when(userRepository.findById("ana")).thenReturn(Optional.of(traveler));
        when(experienceRepository.findByIdForUpdate("trip")).thenReturn(Optional.of(trip));
        when(bookingRepository.existsByUserAndExperienceAndStatusIn(eq(traveler), eq(trip), argThat(s -> s.contains(Booking.DECLINED))))
                .thenReturn(true);

        assertThatThrownBy(() -> bookingService.createBooking("ana", "trip", new BookExperienceRequest(1, null)))
                .isInstanceOf(ApiException.class);
    }

    @Test
    void approvalThatReachesTheMinimumConfirmsTheWholeGroup() {
        Booking earlier = Booking.builder().id("b0").user(User.builder().id("ben").email("ben@x.test").build())
                .experience(trip).seats(1).status(Booking.PENDING).build();
        Booking request = Booking.builder().id("b1").user(traveler).experience(trip).seats(1)
                .status(Booking.REQUESTED).build();
        when(bookingRepository.findById("b1")).thenReturn(Optional.of(request));
        when(experienceRepository.findByIdForUpdate("trip")).thenReturn(Optional.of(trip));
        when(bookingRepository.countFilledSeats(trip)).thenReturn(1L, 2L);
        when(bookingRepository.findByExperienceAndStatus(trip, Booking.PENDING)).thenReturn(List.of(earlier, request));

        bookingService.approveJoinRequest("host", "b1", null);

        assertThat(earlier.getStatus()).isEqualTo(Booking.CONFIRMED);
        assertThat(request.getStatus()).isEqualTo(Booking.CONFIRMED);
        assertThat(request.getDecidedAt()).isNotNull();
        verify(emailService, times(2)).sendBookingConfirmed(any(), eq("Azores island hop"), any());
    }

    @Test
    void approvalIsRefusedWhenTheGroupIsFull() {
        Booking request = Booking.builder().id("b1").user(traveler).experience(trip).seats(1)
                .status(Booking.REQUESTED).build();
        when(bookingRepository.findById("b1")).thenReturn(Optional.of(request));
        when(experienceRepository.findByIdForUpdate("trip")).thenReturn(Optional.of(trip));
        when(bookingRepository.countFilledSeats(trip)).thenReturn(6L);

        assertThatThrownBy(() -> bookingService.approveJoinRequest("host", "b1", null))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("full");
        assertThat(request.getStatus()).isEqualTo(Booking.REQUESTED);
    }

    @Test
    void onlyTheHostCanDecide() {
        Booking request = Booking.builder().id("b1").user(traveler).experience(trip).seats(1)
                .status(Booking.REQUESTED).build();
        when(bookingRepository.findById("b1")).thenReturn(Optional.of(request));

        assertThatThrownBy(() -> bookingService.declineJoinRequest("ana", "b1", null))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("host");
    }
}
