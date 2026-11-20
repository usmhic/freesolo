package com.freesolo.api.dto.play;

import com.freesolo.api.dto.routing.RouteResult;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.Map;

/** Requests and responses for the city history game ({@code /api/play}). */
public final class PlayDtos {

    private PlayDtos() {
    }

    // ── Content files (play/cities/<city>/city.json and missions/*.json) ────

    public record Source(String label, String url) {}

    /** A Wikimedia Commons photo and the credit its licence requires. */
    public record Photo(String url, String page, String author, String license) {}

    /** A key fact shown big after solving: {@code value} ("1886") over {@code label} ("opened"). */
    public record Fact(String value, String label) {}

    /** A city's words in one language. */
    public record CityText(String name, String country, String tagline, String intro) {}

    /** {@code text} holds the city's words in every supported language. */
    public record CityFile(String id, int order, String emoji, List<String> colors, double[] center, Photo photo,
                           Map<String, CityText> text) {}

    /** A mission's words in one language. */
    public record MissionText(String title, String place, String era, String hook, String challenge,
                              List<String> hints, String story, List<Fact> facts) {}

    /**
     * One mission. {@code accepted} lists correct answers in any language; {@code rubric}
     * tells the AI judge (in English) what counts as correct.
     */
    public record MissionFile(String id, double lat, double lng, int minutes, int points, boolean free,
                              List<String> accepted, String rubric, List<Source> sources, Photo photo,
                              Map<String, MissionText> text) {}

    // ── Content in one language, as the game uses it ─────────────────────────

    public record LessonContent(String id, String title, String place, double lat, double lng, String era,
                                int minutes, int points, boolean free, String hook, String challenge,
                                List<String> accepted, String rubric, List<String> hints, String story,
                                List<Source> sources, List<Fact> facts, Photo photo) {}

    public record CityContent(String id, String name, String country, String emoji, String tagline, String intro,
                              List<String> colors, int order, double[] center, Photo photo,
                              List<LessonContent> lessons) {}

    // ── Responses ────────────────────────────────────────────────────────────

    /** A star rank. {@code next} is null at the top rank. */
    public record Rank(String key, String name, int minStardust, Integer nextAt, String nextName) {}

    public record CitySummary(String id, String name, String country, String emoji, String tagline, String intro,
                              List<String> colors, double[] center, Photo photo, int lessons, int freeLessons,
                              int points, boolean unlocked, int solved) {}

    /** What a player sees before solving: never the accepted answers or the story. */
    public record LessonCard(String id, String title, String place, double lat, double lng, String era,
                             int minutes, int points, boolean free, boolean locked, boolean solved, String hook, Photo photo) {}

    public record CityView(CitySummary city, List<LessonCard> lessons) {}

    public record LessonView(LessonCard card, String cityId, String cityName, String challenge, List<String> hints,
                             boolean aiJudge) {}

    public record PlayerView(int stardust, Rank rank, List<String> solvedLessonIds, List<String> unlockedCityIds) {}

    public record AttemptResult(boolean correct, String feedback, String judgedBy, String story, List<Source> sources,
                                List<Fact> facts, int stardustEarned, boolean alreadySolved, PlayerView player) {}

    public record JourneyDay(int day, List<LessonCard> lessons) {}

    /** One row of the global ranking. Names are shortened ("Hana O.") so the board stays friendly. */
    public record Standing(int position, String name, String initial, int stardust, int solved, int cities,
                           Rank rank, boolean me) {}

    /** {@code me} is the signed-in player's own row, even when it's outside the top list. */
    public record Leaderboard(String period, int players, List<Standing> top, Standing me) {}

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
