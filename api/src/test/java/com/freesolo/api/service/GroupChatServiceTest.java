package com.freesolo.api.service;

import com.freesolo.api.entity.Booking;
import com.freesolo.api.entity.Experience;
import com.freesolo.api.entity.GroupMessage;
import com.freesolo.api.entity.User;
import com.freesolo.api.exception.ApiException;
import com.freesolo.api.repository.BookingRepository;
import com.freesolo.api.repository.ExperienceRepository;
import com.freesolo.api.repository.GroupMessageRepository;
import com.freesolo.api.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GroupChatServiceTest {

    @Mock GroupMessageRepository messageRepository;
    @Mock ExperienceRepository experienceRepository;
    @Mock BookingRepository bookingRepository;
    @Mock UserRepository userRepository;
    @Mock NotificationService notificationService;

    @InjectMocks GroupChatService groupChatService;

    User host;
    User ana;
    User ben;
    Experience trip;

    @BeforeEach
    void setUp() {
        host = User.builder().id("host").name("Hana").build();
        ana = User.builder().id("ana").name("Ana").build();
        ben = User.builder().id("ben").name("Ben").build();
        trip = Experience.builder().id("trip").kind(Experience.KIND_TRIP).host(host).title("Azores island hop").build();
        when(experienceRepository.findById("trip")).thenReturn(Optional.of(trip));
        lenient().when(messageRepository.save(any(GroupMessage.class))).thenAnswer(inv -> {
            GroupMessage m = inv.getArgument(0);
            m.setId("msg");
            return m;
        });
    }

    @Test
    void travelersWithoutASeatCannotReadTheChat() {
        when(userRepository.findById("ana")).thenReturn(Optional.of(ana));
        when(bookingRepository.existsByUserAndExperienceAndStatusIn(eq(ana), eq(trip), anyList())).thenReturn(false);

        assertThatThrownBy(() -> groupChatService.list("ana", "trip", null))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("place in the group");
    }

    @Test
    void aJoinRequestDoesNotGrantAccess() {
        when(userRepository.findById("ana")).thenReturn(Optional.of(ana));
        when(bookingRepository.existsByUserAndExperienceAndStatusIn(eq(ana), eq(trip), anyList())).thenReturn(false);

        assertThatThrownBy(() -> groupChatService.post("ana", "trip", "hi"))
                .isInstanceOf(ApiException.class);
        verify(bookingRepository).existsByUserAndExperienceAndStatusIn(eq(ana), eq(trip),
                argThat(s -> !s.contains(Booking.REQUESTED) && s.contains(Booking.CONFIRMED)));
        verify(messageRepository, never()).save(any());
    }

    @Test
    void theFirstMessageAfterAQuietSpellNotifiesEveryoneElse() {
        when(userRepository.findById("ana")).thenReturn(Optional.of(ana));
        when(bookingRepository.existsByUserAndExperienceAndStatusIn(eq(ana), eq(trip), anyList())).thenReturn(true);
        when(messageRepository.findFirstByExperienceOrderByCreatedAtDesc(trip)).thenReturn(Optional.empty());
        when(bookingRepository.findByExperienceAndStatusInOrderByCreatedAtAsc(eq(trip), anyList())).thenReturn(List.of(
                Booking.builder().user(ana).build(), Booking.builder().user(ben).build()));

        var msg = groupChatService.post("ana", "trip", "  Who's up for the sunrise hike?  ");

        assertThat(msg.body()).isEqualTo("Who's up for the sunrise hike?");
        assertThat(msg.author().host()).isFalse();
        verify(notificationService).create(eq("host"), eq("group_message"), any(), any(), any());
        verify(notificationService).create(eq("ben"), eq("group_message"), any(), any(), any());
        verify(notificationService, never()).create(eq("ana"), any(), any(), any(), any());
    }

    @Test
    void anActiveChatDoesNotNotifyAgain() {
        when(userRepository.findById("host")).thenReturn(Optional.of(host));
        when(messageRepository.findFirstByExperienceOrderByCreatedAtDesc(trip)).thenReturn(Optional.of(
                GroupMessage.builder().createdAt(LocalDateTime.now().minusMinutes(2)).build()));

        var msg = groupChatService.post("host", "trip", "Meeting at the marina at 9");

        assertThat(msg.author().host()).isTrue();
        verifyNoInteractions(notificationService);
    }

    @Test
    void pollingReReadsAShortOverlapBehindTheCursor() {
        when(userRepository.findById("ben")).thenReturn(Optional.of(ben));
        when(bookingRepository.existsByUserAndExperienceAndStatusIn(eq(ben), eq(trip), anyList())).thenReturn(true);
        LocalDateTime cursor = LocalDateTime.of(2026, 11, 10, 9, 0);

        groupChatService.list("ben", "trip", cursor);

        verify(messageRepository).findByExperienceAndCreatedAtAfterOrderByCreatedAtAsc(
                eq(trip), eq(cursor.minus(GroupChatService.POLL_OVERLAP)), any());
    }
}
