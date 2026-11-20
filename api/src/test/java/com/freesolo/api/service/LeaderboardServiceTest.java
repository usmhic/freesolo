package com.freesolo.api.service;

import com.freesolo.api.entity.User;
import com.freesolo.api.exception.ApiException;
import com.freesolo.api.repository.LessonProgressRepository;
import com.freesolo.api.repository.LessonProgressRepository.Total;
import com.freesolo.api.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LeaderboardServiceTest {

    @Mock LessonProgressRepository progress;
    @Mock UserRepository users;

    LeaderboardService service;
    final Clock clock = Clock.fixed(Instant.parse("2026-11-20T12:00:00Z"), ZoneOffset.UTC);

    record T(String getUserId, long getStardust, long getSolved, long getCities) implements Total {}

    @BeforeEach
    void setUp() {
        service = new LeaderboardService(progress, users, clock);
        lenient().when(users.findAllById(any())).thenReturn(List.of(
                User.builder().id("hana").name("Hana Okafor").build(),
                User.builder().id("tomas").name("Tomás").build(),
                User.builder().id("anon").build()));
    }

    @Test
    void ranksPlayersWithShortNamesStarRanksAndMyOwnRow() {
        when(progress.ranking(any(), any())).thenReturn(List.of(new T("hana", 1200, 9, 2), new T("tomas", 300, 3, 1)));
        when(progress.totalFor(eq("anon"), any())).thenReturn(List.of(new T("anon", 100, 1, 1)));
        when(progress.allTime(any())).thenReturn(List.of(new T("hana", 1200, 9, 2), new T("tomas", 300, 3, 1), new T("anon", 100, 1, 1)));
        when(progress.playersAhead(any(), eq(100L))).thenReturn(2L);
        when(progress.players(any())).thenReturn(3L);

        var board = service.leaderboard("all", "anon");

        assertThat(board.top()).extracting(s -> s.name()).containsExactly("Hana O.", "Tomás");
        assertThat(board.top().get(0).position()).isEqualTo(1);
        assertThat(board.top().get(0).rank().key()).isEqualTo("red-giant");
        assertThat(board.me().position()).isEqualTo(3);
        assertThat(board.me().name()).isEqualTo("Traveller");
        assertThat(board.me().me()).isTrue();
        assertThat(board.players()).isEqualTo(3);
    }

    @Test
    void theWeekCountsOnlyTheLastSevenDays() {
        when(progress.ranking(any(), any())).thenReturn(List.of());
        when(progress.allTime(any())).thenReturn(List.of());

        service.leaderboard("week", null);

        verify(progress).ranking(eq(LocalDateTime.of(2026, 11, 13, 12, 0)), any());
        verify(progress, never()).totalFor(any(), any());
    }

    @Test
    void rejectsUnknownPeriods() {
        assertThatThrownBy(() -> service.leaderboard("month", null)).isInstanceOf(ApiException.class);
    }
}
