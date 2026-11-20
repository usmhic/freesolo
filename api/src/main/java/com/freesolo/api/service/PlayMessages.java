package com.freesolo.api.service;

import java.util.Map;

/** The few sentences the game API says to players, in every supported language. */
final class PlayMessages {

    static final String SPOT_ON = "spotOn";
    static final String NOT_QUITE = "notQuite";
    static final String NEED_ANSWER = "needAnswer";
    static final String PHOTO_OFF = "photoOff";
    static final String PHOTO_UNAVAILABLE = "photoUnavailable";
    static final String BAD_PHOTO = "badPhoto";
    static final String PACK_LOCKED = "packLocked";

    private static final Map<String, Map<String, String>> TEXT = Map.of(
            "en", Map.of(
                    SPOT_ON, "Spot on!",
                    NOT_QUITE, "Not quite — look again, or take a hint.",
                    NEED_ANSWER, "Type an answer or add a photo",
                    PHOTO_OFF, "Photo checks aren't switched on yet — type your answer instead",
                    PHOTO_UNAVAILABLE, "We couldn't check your photo right now — try typing your answer",
                    BAD_PHOTO, "Photos must be JPEG, PNG, WebP or GIF",
                    PACK_LOCKED, "Unlock the %s pack to play this mission"),
            "fr", Map.of(
                    SPOT_ON, "Bravo !",
                    NOT_QUITE, "Pas tout à fait — regardez encore, ou prenez un indice.",
                    NEED_ANSWER, "Tapez une réponse ou ajoutez une photo",
                    PHOTO_OFF, "La vérification des photos n'est pas encore activée — tapez plutôt votre réponse",
                    PHOTO_UNAVAILABLE, "Impossible de vérifier votre photo pour le moment — essayez de taper votre réponse",
                    BAD_PHOTO, "Les photos doivent être en JPEG, PNG, WebP ou GIF",
                    PACK_LOCKED, "Débloquez le pack %s pour jouer cette mission"),
            "es", Map.of(
                    SPOT_ON, "¡Exacto!",
                    NOT_QUITE, "Casi — vuelve a mirar o pide una pista.",
                    NEED_ANSWER, "Escribe una respuesta o añade una foto",
                    PHOTO_OFF, "La comprobación de fotos aún no está activada — escribe tu respuesta",
                    PHOTO_UNAVAILABLE, "Ahora no podemos comprobar tu foto — prueba a escribir tu respuesta",
                    BAD_PHOTO, "Las fotos deben ser JPEG, PNG, WebP o GIF",
                    PACK_LOCKED, "Desbloquea el pack de %s para jugar esta misión"),
            "ar", Map.of(
                    SPOT_ON, "أحسنت!",
                    NOT_QUITE, "ليس تمامًا — انظر مرة أخرى أو خذ تلميحًا.",
                    NEED_ANSWER, "اكتب إجابة أو أضف صورة",
                    PHOTO_OFF, "التحقق من الصور غير مفعّل بعد — اكتب إجابتك بدلًا من ذلك",
                    PHOTO_UNAVAILABLE, "تعذّر التحقق من صورتك الآن — جرّب كتابة إجابتك",
                    BAD_PHOTO, "يجب أن تكون الصور بصيغة JPEG أو PNG أو WebP أو GIF",
                    PACK_LOCKED, "افتح حزمة %s لتلعب هذه المهمة"));

    private PlayMessages() {
    }

    static String get(String lang, String key, Object... args) {
        String text = TEXT.getOrDefault(lang, TEXT.get(Languages.DEFAULT)).get(key);
        return args.length == 0 ? text : text.formatted(args);
    }
}
