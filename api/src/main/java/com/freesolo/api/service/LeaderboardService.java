package com.freesolo.api.service;

import com.freesolo.api.dto.play.PlayDtos.Leaderboard;
import com.freesolo.api.dto.play.PlayDtos.Standing;
import com.freesolo.api.entity.User;
import com.freesolo.api.exception.ApiException;
import com.freesolo.api.repository.LessonProgressRepository;
import com.freesolo.api.repository.LessonProgressRepository.Total;
import com.freesolo.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * The global ranking: players ordered by the stardust they've earned, all
 * time or over the last seven days. Only signed-in players are ranked.
 */
@Service
@RequiredArgsConstructor
public class LeaderboardService {

    static final int TOP = 50;

    private final LessonProgressRepository progressRepository;
    private final UserRepository userRepository;
    private final Clock clock;

    public Leaderboard leaderboard(String period, String userId) {
        LocalDateTime since = switch (period) {
            case "all" -> LocalDateTime.of(2000, 1, 1, 0, 0);
            case "week" -> LocalDateTime.now(clock).minusDays(7);
            default -> throw ApiException.badRequest("Period must be 'all' or 'week'");
        };
        List<Total> top = progressRepository.ranking(since, PageRequest.of(0, TOP));
        Total mine = userId == null ? null : progressRepository.totalFor(userId, since).stream().findFirst().orElse(null);

        Set<String> ids = new HashSet<>();
        top.forEach(t -> ids.add(t.getUserId()));
        if (mine != null) ids.add(userId);
        Map<String, User> users = userRepository.findAllById(ids).stream().collect(Collectors.toMap(User::getId, Function.identity()));
        Map<String, Long> allTime = progressRepository.allTime(ids).stream()
                .collect(Collectors.toMap(Total::getUserId, Total::getStardust));

        List<Standing> rows = new ArrayList<>();
        for (int i = 0; i < top.size(); i++) {
            rows.add(standing(i + 1, top.get(i), users, allTime, userId));
        }
        Standing me = null;
        if (mine != null) {
            int position = (int) progressRepository.playersAhead(since, mine.getStardust()) + 1;
            me = standing(position, mine, users, allTime, userId);
        }
        return new Leaderboard(period, (int) progressRepository.players(since), rows, me);
    }

    private static Standing standing(int position, Total t, Map<String, User> users, Map<String, Long> allTime, String me) {
        String name = shortName(Optional.ofNullable(users.get(t.getUserId())).map(User::getName).orElse(null));
        int lifetime = allTime.getOrDefault(t.getUserId(), t.getStardust()).intValue();
        return new Standing(position, name, name.substring(0, 1).toUpperCase(Locale.ROOT), (int) t.getStardust(),
                (int) t.getSolved(), (int) t.getCities(), StarRanks.rankFor(lifetime), t.getUserId().equals(me));
    }

    /** "Hana Okafor" → "Hana O."; no name → "Traveller". */
    static String shortName(String full) {
        if (full == null || full.isBlank()) return "Traveller";
        String[] parts = full.trim().split("\\s+");
        return parts.length == 1 ? parts[0] : parts[0] + " " + parts[parts.length - 1].charAt(0) + ".";
    }
}
