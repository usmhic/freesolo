package com.freesolo.api.service;

import com.freesolo.api.config.AppProperties;
import com.freesolo.api.dto.play.PlayDtos.LessonContent;
import com.freesolo.api.dto.play.PlayDtos.Source;
import com.freesolo.api.exception.ApiException;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** Answer checks, with Claude's Messages API stood in for by a local server. */
class AnswerJudgeTest {

    static final LessonContent BRIDGE = new LessonContent("bridge", "Bridge", "Dom Luís I Bridge", 41.1, -8.6, "1886", 10,
            true, "hook", "How many decks?", List.of("2", "two decks"), "Two decks.", List.of("h1"), "story",
            List.of(new Source("s", "https://example.org")), List.of(), null);
    static final String PHOTO = "data:image/png;base64,iVBORw0KGgo=";

    HttpServer server;
    final AtomicReference<String> lastBody = new AtomicReference<>();
    final AtomicReference<String> lastKey = new AtomicReference<>();
    volatile int status = 200;
    volatile String reply = message("{\"correct\": true, \"feedback\": \"Yes — two decks!\"}");
    final JsonMapper json = JsonMapper.builder().build();

    static String message(String text) {
        return "{\"content\":[{\"type\":\"text\",\"text\":" + JsonMapper.builder().build().writeValueAsString(text) + "}]}";
    }

    @BeforeEach
    void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/v1/messages", exchange -> {
            lastKey.set(exchange.getRequestHeaders().getFirst("x-api-key"));
            lastBody.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            byte[] out = reply.getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(status, out.length);
            exchange.getResponseBody().write(out);
            exchange.close();
        });
        server.start();
    }

    @AfterEach
    void stop() {
        server.stop(0);
    }

    AnswerJudge judge(boolean ai) {
        AppProperties props = new AppProperties();
        props.getAi().setBaseUrl("http://127.0.0.1:" + server.getAddress().getPort());
        props.getAi().setTimeoutMs(2000);
        if (ai) {
            props.getAi().setApiKey("test-key");
            props.getAi().setModel("test-model");
        }
        return new AnswerJudge(props, json);
    }

    @Test
    void matchingIgnoresCaseAccentsPunctuationAndNumberWords() {
        assertThat(AnswerJudge.matches("It has TWO decks!", List.of("2"))).isTrue();
        assertThat(AnswerJudge.matches("Céuta", List.of("ceuta"))).isTrue();
        assertThat(AnswerJudge.matches("Art & Science", List.of("art and science"))).isFalse();
        assertThat(AnswerJudge.matches("art and science", List.of("art and science"))).isTrue();
        // Whole words only: "12" doesn't contain the answer "2".
        assertThat(AnswerJudge.matches("12", List.of("2"))).isFalse();
    }

    @Test
    void aMatchingAnswerNeverCallsTheAi() {
        var verdict = judge(true).judge(BRIDGE, "two", null);

        assertThat(verdict.correct()).isTrue();
        assertThat(verdict.judgedBy()).isEqualTo("match");
        assertThat(lastBody.get()).isNull();
    }

    @Test
    void withoutAiAWrongAnswerIsJustWrongAndPhotosAreRefused() {
        var verdict = judge(false).judge(BRIDGE, "three", null);
        assertThat(verdict.correct()).isFalse();

        assertThatThrownBy(() -> judge(false).judge(BRIDGE, null, PHOTO))
                .isInstanceOf(ApiException.class)
                .satisfies(e -> assertThat(((ApiException) e).getStatus().value()).isEqualTo(422));
    }

    @Test
    void theAiJudgesParaphrasesAndPhotos() {
        var verdict = judge(true).judge(BRIDGE, "one up top, one by the water", PHOTO);

        assertThat(verdict.correct()).isTrue();
        assertThat(verdict.judgedBy()).isEqualTo("ai");
        assertThat(verdict.feedback()).isEqualTo("Yes — two decks!");
        assertThat(lastKey.get()).isEqualTo("test-key");
        assertThat(lastBody.get()).contains("\"model\":\"test-model\"", "\"media_type\":\"image/png\"",
                "<player_answer>one up top, one by the water</player_answer>");
    }

    @Test
    void verdictJsonIsFoundEvenWithTextAroundIt() {
        reply = message("Here you go:\n{\"correct\": false, \"feedback\": \"Look up higher.\"}");

        var verdict = judge(true).judge(BRIDGE, "a big one", null);

        assertThat(verdict.correct()).isFalse();
        assertThat(verdict.feedback()).isEqualTo("Look up higher.");
    }

    @Test
    void whenTheAiFailsATypedAnswerFallsBackToMatching() {
        status = 500;
        reply = "{\"error\":{}}";

        var verdict = judge(true).judge(BRIDGE, "a big one", null);

        assertThat(verdict.correct()).isFalse();
        assertThat(verdict.judgedBy()).isEqualTo("match");
    }

    @Test
    void rejectsEmptyAnswersAndNonImagePhotos() {
        assertThatThrownBy(() -> judge(true).judge(BRIDGE, "  ", null)).isInstanceOf(ApiException.class);
        assertThatThrownBy(() -> judge(true).judge(BRIDGE, null, "data:text/html;base64,PGh0bWw+"))
                .isInstanceOf(ApiException.class);
    }
}
