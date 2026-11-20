package com.freesolo.api.service;

import com.freesolo.api.dto.play.PlayDtos.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** Small cities and missions for tests, with text in every supported language. */
final class PlayFixtures {

    private PlayFixtures() {
    }

    static MissionFile mission(String id, double lat, double lng, boolean free) {
        Map<String, MissionText> text = new HashMap<>();
        for (String lang : Languages.SUPPORTED) {
            text.put(lang, new MissionText(id + " (" + lang + ")", "place", "era", "hook", "challenge",
                    List.of("h1", "h2"), "story " + id + " " + lang, List.of(new Fact("1886", "opened " + lang))));
        }
        return new MissionFile(id, lat, lng, 10, 200, free, List.of("yes"), "rubric",
                List.of(new Source("s", "https://example.org")), null, text);
    }

    static CityFile city(String id) {
        Map<String, CityText> text = new HashMap<>();
        for (String lang : Languages.SUPPORTED) text.put(lang, new CityText(id + " " + lang, "Land", "tag", "intro"));
        return new CityFile(id, 1, "🏰", List.of("#000000", "#ffffff"), new double[]{0, 0}, null, text);
    }

    /** "town": far, near (both free) and mid (in the pack), on a line east of the centre. */
    static PlayContent town() {
        return new PlayContent(List.of(new PlayContent.Loaded(city("town"), List.of(
                mission("town-far", 0, 0.03, true), mission("town-near", 0, 0.01, true), mission("town-mid", 0, 0.02, false)))));
    }
}
