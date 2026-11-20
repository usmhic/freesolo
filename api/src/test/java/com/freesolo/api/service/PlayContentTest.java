package com.freesolo.api.service;

import com.freesolo.api.dto.play.PlayDtos.*;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** Guards the content in play/cities/ — the rules a new city or mission must follow. */
class PlayContentTest {

    static final PlayContent SHIPPED;

    static {
        try {
            SHIPPED = new PlayContent(JsonMapper.builder().build());
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    @Test
    void theShippedCitiesLoadInOrderInEveryLanguage() {
        for (String lang : Languages.SUPPORTED) {
            assertThat(SHIPPED.cities(lang)).extracting(CityContent::id)
                    .containsExactly("tangier", "porto", "cordoba", "rotterdam", "salzburg");
            assertThat(SHIPPED.cities(lang)).allSatisfy(c -> assertThat(c.lessons()).hasSizeGreaterThanOrEqualTo(6));
        }
        assertThat(SHIPPED.city("tangier", "ar").name()).isEqualTo("طنجة");
        assertThat(SHIPPED.lesson("porto-luis-bridge", "fr").title()).isEqualTo("Le pont de l'atelier d'Eiffel");
    }

    @Test
    void everyPhotoTheContentNamesExistsInTheWebApp() {
        // The web app serves the photos; this catches a mission pointing at a file nobody added.
        Path photos = Path.of("..", "web", "public");
        List<String> missing = new ArrayList<>();
        for (CityContent c : SHIPPED.cities("en")) {
            List<Photo> all = new ArrayList<>();
            if (c.photo() != null) all.add(c.photo());
            c.lessons().stream().map(LessonContent::photo).filter(p -> p != null).forEach(all::add);
            for (Photo p : all) {
                for (String file : List.of(p.url(), p.url().replace(".webp", "-330.webp"))) {
                    if (!Files.exists(photos.resolve(file.substring(1)))) missing.add(file);
                }
            }
        }
        assertThat(missing).isEmpty();
    }

    @Test
    void aMissionMissingALanguageIsRejectedWithAClearMessage() {
        MissionFile m = PlayFixtures.mission("town-gate", 0, 0, true);
        Map<String, MissionText> onlyEnglish = Map.of("en", m.text().get("en"));
        MissionFile broken = new MissionFile(m.id(), 0, 0, 10, 100, true, m.accepted(), m.rubric(), m.sources(), null, onlyEnglish);

        assertThatThrownBy(() -> new PlayContent(List.of(new PlayContent.Loaded(PlayFixtures.city("town"), List.of(broken)))))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Invalid play content: town-gate: text.fr is missing");
    }

    @Test
    void missionIdsStartWithTheirCity() {
        MissionFile stray = PlayFixtures.mission("gate", 0, 0, true);

        assertThatThrownBy(() -> new PlayContent(List.of(new PlayContent.Loaded(PlayFixtures.city("town"), List.of(stray)))))
                .hasMessageContaining("mission ids start with the city id");
    }
}
