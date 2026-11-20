package com.freesolo.api.service;

import com.freesolo.api.dto.play.PlayDtos.*;
import com.freesolo.api.dto.routing.RouteResult;
import com.freesolo.api.entity.CityUnlock;
import com.freesolo.api.entity.LessonProgress;
import com.freesolo.api.exception.ApiException;
import com.freesolo.api.repository.CityUnlockRepository;
import com.freesolo.api.repository.LessonProgressRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * The city history game. Anyone can play a city's free lessons; a player's
 * progress, stardust and rank are saved when they're signed in (a signed-out
 * player keeps them in their browser). {@code userId} is null when signed out.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PlayService {

    static final String WALKING = "foot-walking";

    private final PlayContent content;
    private final AnswerJudge judge;
    private final RoutingService routingService;
    private final LessonProgressRepository progressRepository;
    private final CityUnlockRepository unlockRepository;

    public List<Rank> ranks() {
        return StarRanks.all();
    }

    public List<CitySummary> cities(String userId) {
        Progress p = progress(userId);
        return content.cities().stream().map(c -> summary(c, p)).toList();
    }

    public CityView city(String userId, String cityId) {
        CityContent c = content.city(cityId);
        Progress p = progress(userId);
        return new CityView(summary(c, p), c.lessons().stream().map(l -> card(l, c.id(), p)).toList());
    }

    public LessonView lesson(String userId, String lessonId) {
        LessonContent l = content.lesson(lessonId);
        String cityId = content.cityOf(lessonId);
        Progress p = progress(userId);
        LessonCard card = card(l, cityId, p);
        if (card.locked()) throw ApiException.forbidden("Unlock the " + content.city(cityId).name() + " pack to play this lesson");
        return new LessonView(card, cityId, content.city(cityId).name(), l.challenge(), l.hints(), judge.aiEnabled());
    }

    @Transactional
    public AttemptResult attempt(String userId, String lessonId, AttemptRequest req) {
        LessonContent l = content.lesson(lessonId);
        String cityId = content.cityOf(lessonId);
        Progress before = progress(userId);
        if (card(l, cityId, before).locked()) {
            throw ApiException.forbidden("Unlock the " + content.city(cityId).name() + " pack to play this lesson");
        }
        int hints = Math.min(Math.max(req.hintsUsed(), 0), l.hints().size());

        AnswerJudge.Verdict verdict = judge.judge(l, req.answer(), req.photo());
        if (!verdict.correct()) {
            return new AttemptResult(false, verdict.feedback(), verdict.judgedBy(), null, null, null, 0, false,
                    userId == null ? null : player(userId));
        }

        boolean already = before.solved().contains(lessonId);
        int earned = already ? 0 : StarRanks.stardustFor(l.points(), hints);
        if (userId != null && !already) {
            try {
                progressRepository.saveAndFlush(LessonProgress.builder()
                        .userId(userId).cityId(cityId).lessonId(lessonId).stardust(earned).hintsUsed(hints).build());
            } catch (DataIntegrityViolationException e) {
                // Solved twice at once (two tabs): the first save counts.
                already = true;
                earned = 0;
            }
        }
        return new AttemptResult(true, verdict.feedback(), verdict.judgedBy(), l.story(), l.sources(),
                l.facts() == null ? List.of() : l.facts(), earned, already,
                userId == null ? null : player(userId));
    }

    /** Pilot: unlocking a city pack is free while payments aren't built. */
    @Transactional
    public CityView unlock(String userId, String cityId) {
        content.city(cityId);
        if (!unlockRepository.existsByUserIdAndCityId(userId, cityId)) {
            unlockRepository.save(CityUnlock.builder().userId(userId).cityId(cityId).build());
        }
        return city(userId, cityId);
    }

    public PlayerView player(String userId) {
        List<LessonProgress> solved = progressRepository.findByUserIdOrderBySolvedAtDesc(userId);
        int stardust = solved.stream().mapToInt(LessonProgress::getStardust).sum();
        return new PlayerView(stardust, StarRanks.rankFor(stardust),
                solved.stream().map(LessonProgress::getLessonId).toList(),
                unlockRepository.findByUserId(userId).stream().map(CityUnlock::getCityId).toList());
    }

    /**
     * Orders a city's lessons into a walk (nearest next stop, starting from the
     * one closest to the centre) and splits it evenly over the days of the trip.
     */
    public JourneyView journey(String userId, JourneyRequest req) {
        CityContent c = content.city(req.cityId());
        Progress p = progress(userId);
        List<LessonContent> order = walkingOrder(c);
        int days = Math.min(Math.max(req.days(), 1), order.size());
        int perDay = (int) Math.ceil(order.size() / (double) days);

        List<JourneyDay> plan = new ArrayList<>();
        for (int d = 0; d < days; d++) {
            List<LessonCard> cards = order.subList(Math.min(d * perDay, order.size()), Math.min((d + 1) * perDay, order.size()))
                    .stream().map(l -> card(l, c.id(), p)).toList();
            if (!cards.isEmpty()) plan.add(new JourneyDay(d + 1, cards));
        }

        RouteResult route = null;
        try {
            route = routingService.route(WALKING, order.stream().map(l -> new double[]{l.lng(), l.lat()}).toList());
        } catch (ApiException e) {
            log.info("No walking route for {}: {}", c.id(), e.getMessage());
        }
        return new JourneyView(summary(c, p), req.startDate(), plan, route);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    record Progress(Set<String> solved, Set<String> unlockedCities) {}

    private Progress progress(String userId) {
        if (userId == null) return new Progress(Set.of(), Set.of());
        Set<String> solved = new HashSet<>();
        progressRepository.findByUserIdOrderBySolvedAtDesc(userId).forEach(s -> solved.add(s.getLessonId()));
        Set<String> unlocked = new HashSet<>();
        unlockRepository.findByUserId(userId).forEach(u -> unlocked.add(u.getCityId()));
        return new Progress(solved, unlocked);
    }

    private CitySummary summary(CityContent c, Progress p) {
        int free = (int) c.lessons().stream().filter(LessonContent::free).count();
        int solved = (int) c.lessons().stream().filter(l -> p.solved().contains(l.id())).count();
        return new CitySummary(c.id(), c.name(), c.country(), c.emoji(), c.tagline(), c.intro(), c.colors(),
                c.center(), c.photo(), c.lessons().size(), free, c.lessons().stream().mapToInt(LessonContent::points).sum(),
                p.unlockedCities().contains(c.id()), solved);
    }

    private LessonCard card(LessonContent l, String cityId, Progress p) {
        boolean locked = !l.free() && !p.unlockedCities().contains(cityId);
        return new LessonCard(l.id(), l.title(), l.place(), l.lat(), l.lng(), l.era(), l.minutes(), l.points(), l.free(), locked,
                p.solved().contains(l.id()), l.hook(), l.photo());
    }

    static List<LessonContent> walkingOrder(CityContent c) {
        List<LessonContent> left = new ArrayList<>(c.lessons());
        List<LessonContent> order = new ArrayList<>();
        double lat = c.center()[0];
        double lng = c.center()[1];
        while (!left.isEmpty()) {
            final double fromLat = lat, fromLng = lng;
            LessonContent next = Collections.min(left, Comparator.comparingDouble(l -> distance(fromLat, fromLng, l.lat(), l.lng())));
            order.add(next);
            left.remove(next);
            lat = next.lat();
            lng = next.lng();
        }
        return order;
    }

    private static double distance(double lat1, double lng1, double lat2, double lng2) {
        double x = Math.toRadians(lng2 - lng1) * Math.cos(Math.toRadians((lat1 + lat2) / 2));
        double y = Math.toRadians(lat2 - lat1);
        return Math.sqrt(x * x + y * y);
    }
}
