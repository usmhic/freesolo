package com.freesolo.api.service;

import java.util.List;
import java.util.Locale;

/** The languages the game speaks, and how a request picks one. */
public final class Languages {

    public static final List<String> SUPPORTED = List.of("en", "fr", "es", "ar");
    public static final String DEFAULT = "en";

    private Languages() {
    }

    /** An explicit {@code ?lang=} wins; otherwise the first supported Accept-Language; otherwise English. */
    public static String resolve(String param, String acceptLanguage) {
        String chosen = pick(param);
        if (chosen != null) return chosen;
        if (acceptLanguage != null) {
            for (String part : acceptLanguage.split(",")) {
                chosen = pick(part.split(";")[0]);
                if (chosen != null) return chosen;
            }
        }
        return DEFAULT;
    }

    private static String pick(String tag) {
        if (tag == null || tag.isBlank()) return null;
        String base = tag.trim().toLowerCase(Locale.ROOT).split("[-_]")[0];
        return SUPPORTED.contains(base) ? base : null;
    }

    /** The language's name, for telling the AI judge which language to answer in. */
    static String englishName(String lang) {
        return switch (lang) {
            case "fr" -> "French";
            case "es" -> "Spanish";
            case "ar" -> "Arabic";
            default -> "English";
        };
    }
}
