package com.freesolo.api.service;

import com.freesolo.api.dto.play.PlayDtos.*;
import com.freesolo.api.entity.CityUnlock;
import com.freesolo.api.entity.LessonProgress;
import com.freesolo.api.exception.ApiException;
import com.freesolo.api.repository.CityUnlockRepository;
import com.freesolo.api.repository.LessonProgressRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import tools.jackson.databind.json.JsonMapper;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PlayServiceTest {

    @Mock AnswerJudge judge;
    @Mock RoutingService routingService;
    @Mock LessonProgressRepository progressRepository;
    @Mock CityUnlockRepository unlockRepository;

    static final List<Source> SRC = List.of(new Source("s", "https://example.org"));
    static LessonContent lesson(String id, double lat, double lng, boolean free) {
        return new LessonContent(id, id, id, lat, lng, "era", 10, free, "hook", "challenge", List.of("yes"),
                "rubric", List.of("h1", "h2"), "story " + id, SRC);
    }
    static final CityContent TOWN = new CityContent("town", "Town", "Land", "🏰", "tag", new double[]{0, 0}, List.of(
            lesson("far", 0, 0.03, true), lesson("near", 0, 0.01, true), lesson("mid", 0, 0.02, false)));

    PlayService service;

    @BeforeEach
    void setUp() {
        service = new PlayService(new PlayContent(List.of(TOWN)), judge, routingService, progressRepository, unlockRepository);
        lenient().when(judge.judge(any(), any(), any())).thenReturn(new AnswerJudge.Verdict(true, "Spot on!", "match"));
    }

    @Test
    void packLessonsAreLockedUntilTheCityIsUnlocked() {
        assertThatThrownBy(() -> service.lesson(null, "mid"))
                .isInstanceOf(ApiException.class)
                .satisfies(e -> assertThat(((ApiException) e).getStatus()).isEqualTo(HttpStatus.FORBIDDEN));

        when(unlockRepository.findByUserId("ana")).thenReturn(List.of(CityUnlock.builder().userId("ana").cityId("town").build()));
        assertThat(service.lesson("ana", "mid").card().locked()).isFalse();
    }

    @Test
    void aCorrectAnswerSavesStardustOnceForASignedInPlayer() {
        var result = service.attempt("ana", "near", new AttemptRequest("yes", null, 1));

        assertThat(result.correct()).isTrue();
        assertThat(result.story()).isEqualTo("story near");
        assertThat(result.stardustEarned()).isEqualTo(75);
        var saved = ArgumentCaptor.forClass(LessonProgress.class);
        verify(progressRepository).saveAndFlush(saved.capture());
        assertThat(saved.getValue().getLessonId()).isEqualTo("near");
        assertThat(saved.getValue().getCityId()).isEqualTo("town");

        when(progressRepository.findByUserIdOrderBySolvedAtDesc("ana")).thenReturn(List.of(
                LessonProgress.builder().userId("ana").lessonId("near").cityId("town").stardust(75).build()));
        var again = service.attempt("ana", "near", new AttemptRequest("yes", null, 0));
        assertThat(again.alreadySolved()).isTrue();
        assertThat(again.stardustEarned()).isZero();
        verify(progressRepository, times(1)).saveAndFlush(any());
    }

    @Test
    void aGuestEarnsStardustWithoutAnythingSaved() {
        var result = service.attempt(null, "near", new AttemptRequest("yes", null, 0));

        assertThat(result.stardustEarned()).isEqualTo(150);
        assertThat(result.player()).isNull();
        verify(progressRepository, never()).saveAndFlush(any());
    }

    @Test
    void aWrongAnswerRevealsNothing() {
        when(judge.judge(any(), any(), any())).thenReturn(new AnswerJudge.Verdict(false, "Look again", "match"));

        var result = service.attempt(null, "near", new AttemptRequest("no", null, 0));

        assertThat(result.correct()).isFalse();
        assertThat(result.story()).isNull();
        assertThat(result.sources()).isNull();
    }

    @Test
    void journeysWalkNearestFirstAndSplitAcrossDays() {
        when(routingService.route(eq("foot-walking"), anyList())).thenThrow(ApiException.unavailable("no route"));

        var journey = service.journey(null, new JourneyRequest("town", "2026-12-01", 2));

        assertThat(journey.days()).hasSize(2);
        assertThat(journey.days().get(0).lessons()).extracting(LessonCard::id).containsExactly("near", "mid");
        assertThat(journey.days().get(1).lessons()).extracting(LessonCard::id).containsExactly("far");
        assertThat(journey.route()).isNull();
    }

    @Test
    void ranksClimbWithStardust() {
        assertThat(StarRanks.rankFor(0).key()).isEqualTo("nebula");
        assertThat(StarRanks.rankFor(150).key()).isEqualTo("protostar");
        assertThat(StarRanks.rankFor(150).nextName()).isEqualTo("White Dwarf");
        assertThat(StarRanks.rankFor(9000).key()).isEqualTo("black-hole");
        assertThat(StarRanks.rankFor(9000).nextAt()).isNull();
        assertThat(StarRanks.stardustFor(5)).isEqualTo(50);
    }

    @Test
    void theShippedCityContentLoadsAndIsValid() throws Exception {
        var content = new PlayContent(JsonMapper.builder().build());

        assertThat(content.cities()).extracting(CityContent::id).contains("porto");
        assertThat(content.city("porto").lessons()).allSatisfy(l -> {
            assertThat(l.sources()).isNotEmpty();
            assertThat(l.accepted()).isNotEmpty();
        });
    }

    @Test
    void invalidContentIsRejected() {
        var noSources = new LessonContent("xx", "x", "x", 0, 0, "e", 1, true, "h", "c", List.of("a"), "r", List.of(),
                "s", List.of());
        assertThatThrownBy(() -> new PlayContent(List.of(new CityContent("cc", "C", "L", "", "", new double[]{0, 0},
                List.of(noSources))))).isInstanceOf(IllegalStateException.class).hasMessageContaining("cites a source");
    }
}
