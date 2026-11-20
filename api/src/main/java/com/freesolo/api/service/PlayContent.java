package com.freesolo.api.service;

import com.freesolo.api.dto.play.PlayDtos.*;
import com.freesolo.api.exception.ApiException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;

/**
 * The curated cities and missions, loaded from {@code classpath:play/cities/}:
 *
 * <pre>
 * play/cities/porto/city.json              the city, with its words in every language
 * play/cities/porto/missions/01-*.json     one file per mission, played in file-name order
 * </pre>
 *
 * Content lives in the repository so every fact is reviewed like code (see
 * play/README.md). A file that breaks the rules below stops the API from
 * starting, with a message naming the file's id and the problem.
 */
@Component
public class PlayContent {

    /** A city's file and its missions, as read from disk (or built in a test). */
    public record Loaded(CityFile city, List<MissionFile> missions) {}

    private final Map<String, Map<String, CityContent>> cities = new HashMap<>(); // lang → id → city
    private final Map<String, Map<String, LessonContent>> lessons = new HashMap<>(); // lang → id → mission
    private final Map<String, String> lessonCity = new HashMap<>();

    @Autowired
    public PlayContent(JsonMapper json) throws IOException {
        this(read(json));
    }

    PlayContent(List<Loaded> content) {
        for (String lang : Languages.SUPPORTED) {
            cities.put(lang, new LinkedHashMap<>());
            lessons.put(lang, new HashMap<>());
        }
        content.stream()
                .sorted(Comparator.comparingInt((Loaded l) -> l.city().order()).thenComparing(l -> l.city().id()))
                .forEach(this::add);
    }

    private static List<Loaded> read(JsonMapper json) throws IOException {
        var resolver = new PathMatchingResourcePatternResolver();
        List<Loaded> out = new ArrayList<>();
        for (Resource cityFile : resolver.getResources("classpath*:play/cities/*/city.json")) {
            CityFile city = parse(json, cityFile, CityFile.class);
            Resource[] files = resolver.getResources("classpath*:play/cities/" + city.id() + "/missions/*.json");
            Arrays.sort(files, Comparator.comparing(Resource::getFilename));
            List<MissionFile> missions = new ArrayList<>();
            for (Resource f : files) missions.add(parse(json, f, MissionFile.class));
            require(!missions.isEmpty(), city.id() + ": no missions found in play/cities/" + city.id() + "/missions/ (is the folder named after the city id?)");
            out.add(new Loaded(city, missions));
        }
        return out;
    }

    private static <T> T parse(JsonMapper json, Resource file, Class<T> type) throws IOException {
        try (InputStream in = file.getInputStream()) {
            return json.readValue(in, type);
        } catch (RuntimeException e) {
            throw new IllegalStateException("Invalid play content: can't read " + file.getFilename() + ": " + e.getMessage(), e);
        }
    }

    // ── Validation and per-language views ───────────────────────────────────

    private void add(Loaded loaded) {
        CityFile c = loaded.city();
        require(c.id() != null && c.id().matches("[a-z0-9-]{2,64}"), "city id must be lowercase letters, digits or dashes: " + c.id());
        require(!lessonCity.containsValue(c.id()) && !cities.get(Languages.DEFAULT).containsKey(c.id()), "duplicate city " + c.id());
        require(c.center() != null && c.center().length == 2, c.id() + ": center must be [lat, lng]");
        require(c.colors() != null && c.colors().size() == 2
                && c.colors().stream().allMatch(x -> x != null && x.matches("#[0-9A-Fa-f]{6}")), c.id() + ": colors must be two hex colours");
        requirePhoto(c.photo(), c.id());
        for (String lang : Languages.SUPPORTED) {
            CityText t = c.text() == null ? null : c.text().get(lang);
            require(t != null && notBlank(t.name()) && notBlank(t.country()) && notBlank(t.tagline()) && notBlank(t.intro()),
                    c.id() + ": text." + lang + " needs name, country, tagline and intro");
        }

        for (MissionFile m : loaded.missions()) validate(c.id(), m);

        for (String lang : Languages.SUPPORTED) {
            List<LessonContent> inLang = loaded.missions().stream().map(m -> view(m, lang)).toList();
            CityText t = c.text().get(lang);
            cities.get(lang).put(c.id(), new CityContent(c.id(), t.name(), t.country(), c.emoji(), t.tagline(), t.intro(),
                    c.colors(), c.order(), c.center(), c.photo(), inLang));
            inLang.forEach(l -> lessons.get(lang).put(l.id(), l));
        }
        loaded.missions().forEach(m -> lessonCity.put(m.id(), c.id()));
    }

    private void validate(String cityId, MissionFile m) {
        String id = m.id();
        require(id != null && id.matches("[a-z0-9-]{2,64}") && id.startsWith(cityId + "-"), cityId + ": mission ids start with the city id, like " + cityId + "-old-bridge (got " + id + ")");
        require(!lessonCity.containsKey(id), "duplicate mission " + id);
        require(Math.abs(m.lat()) <= 90 && Math.abs(m.lng()) <= 180, id + ": bad coordinates");
        require(m.points() >= 50 && m.points() <= 500 && m.points() % 10 == 0, id + ": points must be 50–500, in tens");
        require(m.accepted() != null && !m.accepted().isEmpty(), id + ": needs accepted answers");
        require(notBlank(m.rubric()), id + ": needs a rubric for the AI judge");
        require(m.sources() != null && !m.sources().isEmpty(), id + ": every mission cites a source");
        requirePhoto(m.photo(), id);
        for (String lang : Languages.SUPPORTED) {
            MissionText t = m.text() == null ? null : m.text().get(lang);
            String where = id + ": text." + lang;
            require(t != null, where + " is missing");
            require(notBlank(t.title()) && notBlank(t.place()) && notBlank(t.era()) && notBlank(t.hook())
                    && notBlank(t.challenge()) && notBlank(t.story()), where + " needs title, place, era, hook, challenge and story");
            require(t.hints() != null && !t.hints().isEmpty() && t.hints().size() <= 5, where + ".hints needs one to five hints");
            require(t.facts() != null && t.facts().size() <= 3, where + ".facts has at most three facts");
        }
    }

    private static LessonContent view(MissionFile m, String lang) {
        MissionText t = m.text().get(lang);
        return new LessonContent(m.id(), t.title(), t.place(), m.lat(), m.lng(), t.era(), m.minutes(), m.points(), m.free(),
                t.hook(), t.challenge(), m.accepted(), m.rubric(), t.hints(), t.story(), m.sources(), t.facts(), m.photo());
    }

    /** Photos are optional: Wikimedia Commons images served from /play/photos/, each with its credit. */
    private static void requirePhoto(Photo photo, String owner) {
        if (photo == null) return;
        require(photo.url() != null && photo.url().matches("/play/photos/[a-z0-9-]+\\.webp"), owner + ": photos live in /play/photos/<name>.webp");
        require(photo.page() != null && photo.page().startsWith("https://commons.wikimedia.org/"), owner + ": a photo links to its Commons page");
        require(notBlank(photo.author()) && notBlank(photo.license()), owner + ": a photo needs its author and licence");
    }

    // ── Reads ────────────────────────────────────────────────────────────────

    public Collection<CityContent> cities(String lang) {
        return cities.get(lang).values();
    }

    public CityContent city(String id, String lang) {
        CityContent c = cities.get(lang).get(id);
        if (c == null) throw ApiException.notFound("City not found");
        return c;
    }

    public LessonContent lesson(String id, String lang) {
        LessonContent l = lessons.get(lang).get(id);
        if (l == null) throw ApiException.notFound("Mission not found");
        return l;
    }

    public String cityOf(String lessonId) {
        return lessonCity.get(lessonId);
    }

    private static boolean notBlank(String s) {
        return s != null && !s.isBlank();
    }

    private static void require(boolean ok, String message) {
        if (!ok) throw new IllegalStateException("Invalid play content: " + message);
    }
}
