package com.freesolo.api.service;

import com.freesolo.api.dto.play.PlayDtos.CityContent;
import com.freesolo.api.dto.play.PlayDtos.LessonContent;
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
 * The curated city lessons, loaded from {@code classpath:play/cities/*.json}.
 * Content lives in the repository so every fact is reviewed like code; a file
 * that breaks the rules below stops the API from starting.
 */
@Component
public class PlayContent {

    private final Map<String, CityContent> cities = new LinkedHashMap<>();
    private final Map<String, LessonContent> lessons = new HashMap<>();
    private final Map<String, String> lessonCity = new HashMap<>();

    @Autowired
    public PlayContent(JsonMapper jsonMapper) throws IOException {
        Resource[] files = new PathMatchingResourcePatternResolver().getResources("classpath*:play/cities/*.json");
        List<CityContent> loaded = new ArrayList<>();
        for (Resource file : files) {
            try (InputStream in = file.getInputStream()) {
                loaded.add(jsonMapper.readValue(in, CityContent.class));
            }
        }
        loaded.sort(Comparator.comparingInt(CityContent::order).thenComparing(CityContent::id));
        loaded.forEach(this::add);
    }

    /** For tests: content built in code. */
    PlayContent(List<CityContent> content) {
        content.forEach(this::add);
    }

    private void add(CityContent city) {
        require(city.id() != null && city.id().matches("[a-z0-9-]{2,64}"), "City id must be lowercase letters, digits or dashes");
        require(!cities.containsKey(city.id()), "Duplicate city " + city.id());
        require(city.center() != null && city.center().length == 2, city.id() + ": center must be [lat, lng]");
        require(notBlank(city.intro()), city.id() + ": a city needs an intro");
        require(city.colors() != null && city.colors().size() == 2
                && city.colors().stream().allMatch(c -> c != null && c.matches("#[0-9A-Fa-f]{6}")), city.id() + ": colors must be two hex colours");
        require(city.lessons() != null && !city.lessons().isEmpty(), city.id() + ": a city needs lessons");
        requirePhoto(city.photo(), city.id());
        for (LessonContent l : city.lessons()) {
            require(l.id() != null && l.id().matches("[a-z0-9-]{2,64}"), city.id() + ": bad lesson id " + l.id());
            require(!lessons.containsKey(l.id()), "Duplicate lesson " + l.id());
            require(Math.abs(l.lat()) <= 90 && Math.abs(l.lng()) <= 180, l.id() + ": bad coordinates");
            require(l.accepted() != null && !l.accepted().isEmpty(), l.id() + ": needs accepted answers");
            require(l.hints() != null && l.hints().size() <= 5, l.id() + ": at most five hints");
            require(notBlank(l.challenge()) && notBlank(l.story()) && notBlank(l.hook()), l.id() + ": hook, challenge and story are required");
            require(l.sources() != null && !l.sources().isEmpty(), l.id() + ": every lesson cites a source");
            require(l.facts() == null || l.facts().size() <= 3, l.id() + ": at most three key facts");
            requirePhoto(l.photo(), l.id());
            lessons.put(l.id(), l);
            lessonCity.put(l.id(), city.id());
        }
        cities.put(city.id(), city);
    }

    public Collection<CityContent> cities() {
        return cities.values();
    }

    public CityContent city(String id) {
        CityContent c = cities.get(id);
        if (c == null) throw ApiException.notFound("City not found");
        return c;
    }

    public LessonContent lesson(String id) {
        LessonContent l = lessons.get(id);
        if (l == null) throw ApiException.notFound("Lesson not found");
        return l;
    }

    public String cityOf(String lessonId) {
        return lessonCity.get(lessonId);
    }

    /**
     * Photos are optional. They're Wikimedia Commons images, resized and served
     * by the web app from /play/photos/, and each carries its licence credit.
     */
    private static void requirePhoto(com.freesolo.api.dto.play.PlayDtos.Photo photo, String owner) {
        if (photo == null) return;
        require(photo.url() != null && (photo.url().matches("/play/photos/[a-z0-9-]+\\.webp")
                || photo.url().startsWith("https://upload.wikimedia.org/")), owner + ": photos are served from /play/photos/ or Wikimedia");
        require(photo.page() != null && photo.page().startsWith("https://commons.wikimedia.org/"), owner + ": a photo links to its Commons page");
        require(notBlank(photo.author()) && notBlank(photo.license()) && notBlank(photo.page()), owner + ": a photo needs its author, licence and page");
    }

    private static boolean notBlank(String s) {
        return s != null && !s.isBlank();
    }

    private static void require(boolean ok, String message) {
        if (!ok) throw new IllegalStateException("Invalid play content: " + message);
    }
}
