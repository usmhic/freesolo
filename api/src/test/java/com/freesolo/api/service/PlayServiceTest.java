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

    PlayService service;

    @BeforeEach
    void setUp() {
        service = new PlayService(PlayFixtures.town(), judge, routingService, progressRepository, unlockRepository);
        lenient().when(judge.judge(any(), any(), any(), any())).thenReturn(new AnswerJudge.Verdict(true, "Spot on!", "match"));
    }

    @Test
    void packLessonsAreLockedUntilTheCityIsUnlocked() {
        assertThatThrownBy(() -> service.lesson(null, "town-mid", "en"))
                .isInstanceOf(ApiException.class)
                .satisfies(e -> assertThat(((ApiException) e).getStatus()).isEqualTo(HttpStatus.FORBIDDEN));

        when(unlockRepository.findByUserId("ana")).thenReturn(List.of(CityUnlock.builder().userId("ana").cityId("town").build()));
        assertThat(service.lesson("ana", "town-mid", "en").card().locked()).isFalse();
    }

    @Test
    void aCorrectAnswerSavesStardustOnceForASignedInPlayer() {
        var result = service.attempt("ana", "town-near", new AttemptRequest("yes", null, 1), "en");

        assertThat(result.correct()).isTrue();
        assertThat(result.story()).isEqualTo("story town-near en");
        assertThat(result.facts()).extracting(Fact::value).containsExactly("1886");
        assertThat(result.stardustEarned()).isEqualTo(160); // 200 points, one hint costs a fifth
        var saved = ArgumentCaptor.forClass(LessonProgress.class);
        verify(progressRepository).saveAndFlush(saved.capture());
        assertThat(saved.getValue().getLessonId()).isEqualTo("town-near");
        assertThat(saved.getValue().getCityId()).isEqualTo("town");

        when(progressRepository.findByUserIdOrderBySolvedAtDesc("ana")).thenReturn(List.of(
                LessonProgress.builder().userId("ana").lessonId("town-near").cityId("town").stardust(160).build()));
        var again = service.attempt("ana", "town-near", new AttemptRequest("yes", null, 0), "en");
        assertThat(again.alreadySolved()).isTrue();
        assertThat(again.stardustEarned()).isZero();
        verify(progressRepository, times(1)).saveAndFlush(any());
    }

    @Test
    void aGuestEarnsStardustWithoutAnythingSaved() {
        var result = service.attempt(null, "town-near", new AttemptRequest("yes", null, 0), "en");

        assertThat(result.stardustEarned()).isEqualTo(200);
        assertThat(result.player()).isNull();
        verify(progressRepository, never()).saveAndFlush(any());
    }

    @Test
    void aWrongAnswerRevealsNothing() {
        when(judge.judge(any(), any(), any(), any())).thenReturn(new AnswerJudge.Verdict(false, "Look again", "match"));

        var result = service.attempt(null, "town-near", new AttemptRequest("no", null, 0), "en");

        assertThat(result.correct()).isFalse();
        assertThat(result.story()).isNull();
        assertThat(result.sources()).isNull();
        assertThat(result.facts()).isNull();
    }

    @Test
    void journeysWalkNearestFirstAndSplitAcrossDays() {
        when(routingService.route(eq("foot-walking"), anyList())).thenThrow(ApiException.unavailable("no route"));

        var journey = service.journey(null, new JourneyRequest("town", "2026-12-01", 2), "en");

        assertThat(journey.days()).hasSize(2);
        assertThat(journey.days().get(0).lessons()).extracting(LessonCard::id).containsExactly("town-near", "town-mid");
        assertThat(journey.days().get(1).lessons()).extracting(LessonCard::id).containsExactly("town-far");
        assertThat(journey.route()).isNull();
    }

    @Test
    void ranksClimbWithStardust() {
        assertThat(StarRanks.rankFor(0).key()).isEqualTo("nebula");
        assertThat(StarRanks.rankFor(150).key()).isEqualTo("protostar");
        assertThat(StarRanks.rankFor(150).nextName()).isEqualTo("White Dwarf");
        assertThat(StarRanks.rankFor(9000).key()).isEqualTo("black-hole");
        assertThat(StarRanks.rankFor(9000).nextAt()).isNull();
        assertThat(StarRanks.stardustFor(150, 0)).isEqualTo(150);
        assertThat(StarRanks.stardustFor(150, 1)).isEqualTo(120);
        assertThat(StarRanks.stardustFor(150, 5)).isEqualTo(75);
    }

    @Test
    void contentAndLockedMessagesFollowTheLanguage() {
        assertThat(service.lesson(null, "town-near", "fr").card().title()).isEqualTo("town-near (fr)");
        assertThatThrownBy(() -> service.lesson(null, "town-mid", "es"))
                .isInstanceOf(ApiException.class).hasMessageContaining("Desbloquea");
        var result = service.attempt(null, "town-near", new AttemptRequest("yes", null, 0), "ar");
        assertThat(result.story()).isEqualTo("story town-near ar");
        verify(judge).judge(any(), eq("yes"), isNull(), eq("ar"));
    }
}
