package com.freesolo.api.dto.play;

import com.freesolo.api.dto.routing.RouteResult;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

/** Requests and responses for the city history game ({@code /api/play}). */
public final class PlayDtos {

    private PlayDtos() {
    }

    // ── Curated content, as stored in play/cities/*.json ─────────────────────

    public record Source(String label, String url) {}

    public record LessonContent(String id, String title, String place, double lat, double lng, String era,
                                int minutes, boolean free, String hook, String challenge, List<String> accepted,
                                String rubric, List<String> hints, String story, List<Source> sources) {}

    public record CityContent(String id, String name, String country, String emoji, String tagline,
                              double[] center, List<LessonContent> lessons) {}

    // ── Responses ────────────────────────────────────────────────────────────

    /** A star rank. {@code next} is null at the top rank. */
    public record Rank(String key, String name, int minStardust, Integer nextAt, String nextName) {}

    public record CitySummary(String id, String name, String country, String emoji, String tagline,
                              double[] center, int lessons, int freeLessons, boolean unlocked, int solved) {}

    /** What a player sees before solving: never the accepted answers or the story. */
    public record LessonCard(String id, String title, String place, double lat, double lng, String era,
                             int minutes, boolean free, boolean locked, boolean solved, String hook) {}

    public record CityView(CitySummary city, List<LessonCard> lessons) {}

    public record LessonView(LessonCard card, String cityId, String cityName, String challenge, List<String> hints,
                             boolean aiJudge) {}

    public record PlayerView(int stardust, Rank rank, List<String> solvedLessonIds, List<String> unlockedCityIds) {}

    public record AttemptResult(boolean correct, String feedback, String judgedBy, String story, List<Source> sources,
                                int stardustEarned, boolean alreadySolved, PlayerView player) {}

    public record JourneyDay(int day, List<LessonCard> lessons) {}

    public record JourneyView(CitySummary city, String startDate, List<JourneyDay> days, RouteResult route) {}

    // ── Requests ─────────────────────────────────────────────────────────────

    /** A typed answer, a photo (data URL), or both. */
    public record AttemptRequest(@Size(max = 500) String answer,
                                 @Size(max = 6_000_000) String photo,
                                 @Min(0) @Max(5) int hintsUsed) {}

    public record JourneyRequest(@NotBlank @Size(max = 64) String cityId,
                                 @Size(max = 32) String startDate,
                                 @Min(1) @Max(14) int days) {}
}
