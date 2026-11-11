package com.freesolo.api.service;

import com.freesolo.api.config.AppProperties;
import com.freesolo.api.exception.ApiException;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Exercises the OpenRouteService adapter against a local HTTP server that
 * answers in the documented response shapes (GeoJSON FeatureCollection with
 * properties.summary and properties.segments; Pelias features for places).
 */
class RoutingServiceTest {

    private static final String ROUTE_BODY = """
            {"type":"FeatureCollection","features":[{"type":"Feature",
              "properties":{"segments":[{"distance":1200.5,"duration":300.0},{"distance":800.0,"duration":200.0}],
                            "summary":{"distance":2000.5,"duration":500.0},"way_points":[0,2,4]},
              "geometry":{"type":"LineString","coordinates":[[-9.14,38.71],[-9.13,38.72],[-9.12,38.73],[-9.11,38.74],[-9.10,38.75]]}}]}
            """;

    private static final String PLACES_BODY = """
            {"type":"FeatureCollection","features":[
              {"type":"Feature","geometry":{"type":"Point","coordinates":[-9.1393,38.7223]},
               "properties":{"name":"Lisbon","label":"Lisbon, Portugal","locality":"Lisbon","country":"Portugal"}},
              {"type":"Feature","geometry":{"type":"Point","coordinates":[-8.61]},"properties":{"name":"broken"}}]}
            """;

    private HttpServer server;
    private final AtomicReference<String> lastPath = new AtomicReference<>();
    private final AtomicReference<String> lastQuery = new AtomicReference<>();
    private final AtomicReference<String> lastAuth = new AtomicReference<>();
    private final AtomicReference<String> lastBody = new AtomicReference<>();
    private final AtomicInteger calls = new AtomicInteger();
    private volatile int status = 200;
    private volatile String responseBody = ROUTE_BODY;

    private RoutingService service;

    @BeforeEach
    void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/", exchange -> {
            calls.incrementAndGet();
            lastPath.set(exchange.getRequestURI().getPath());
            lastQuery.set(exchange.getRequestURI().getRawQuery());
            lastAuth.set(exchange.getRequestHeaders().getFirst("Authorization"));
            lastBody.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            byte[] out = responseBody.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(status, out.length);
            exchange.getResponseBody().write(out);
            exchange.close();
        });
        server.start();
        service = service("test-key");
    }

    @AfterEach
    void stop() {
        server.stop(0);
    }

    private RoutingService service(String key) {
        AppProperties props = new AppProperties();
        props.getOrs().setApiKey(key);
        props.getOrs().setBaseUrl("http://127.0.0.1:" + server.getAddress().getPort());
        props.getOrs().setTimeoutMs(2000);
        return new RoutingService(props, JsonMapper.builder().build());
    }

    @Test
    void routesThroughTheGeoJsonDirectionsEndpointWithTheServerKey() {
        var route = service.route("cycling-regular", List.of(new double[]{-9.14, 38.71}, new double[]{-9.10, 38.75}));

        assertThat(lastPath.get()).isEqualTo("/v2/directions/cycling-regular/geojson");
        assertThat(lastAuth.get()).isEqualTo("test-key");
        assertThat(lastBody.get()).contains("\"coordinates\":[[-9.14,38.71],[-9.1,38.75]]");
        assertThat(route.estimated()).isFalse();
        assertThat(route.distanceMeters()).isEqualTo(2000.5);
        assertThat(route.durationSeconds()).isEqualTo(500.0);
        assertThat(route.coordinates()).hasSize(5);
        assertThat(route.coordinates().get(0)).containsExactly(-9.14, 38.71);
        assertThat(route.legs()).extracting(l -> l.distanceMeters()).containsExactly(1200.5, 800.0);
    }

    @Test
    void repeatedRoutesComeFromTheCache() {
        var stops = List.of(new double[]{-9.14, 38.71}, new double[]{-9.10, 38.75});
        service.route("foot-walking", stops);
        service.route("foot-walking", stops);
        assertThat(calls.get()).isEqualTo(1);
    }

    @Test
    void searchesPlacesAndSkipsMalformedFeatures() {
        responseBody = PLACES_BODY;

        var places = service.searchPlaces("Lisb", 38.7, -9.1);

        assertThat(lastPath.get()).isEqualTo("/geocode/autocomplete");
        assertThat(lastQuery.get()).contains("text=Lisb").contains("focus.point.lat=38.7").contains("focus.point.lon=-9.1");
        assertThat(places).hasSize(1);
        assertThat(places.get(0).label()).isEqualTo("Lisbon, Portugal");
        assertThat(places.get(0).lat()).isEqualTo(38.7223);
        assertThat(places.get(0).lng()).isEqualTo(-9.1393);
    }

    @Test
    void unreachableStopsBecomeAClearMessage() {
        status = 404;
        responseBody = """
                {"error":{"code":2010,"message":"Could not find routable point within a radius of 350.0 meters of specified coordinate 1"}}
                """;

        assertThatThrownBy(() -> service.route("driving-car", List.of(new double[]{0, 0}, new double[]{1, 1})))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("can't be reached")
                .extracting(e -> ((ApiException) e).getStatus()).isEqualTo(HttpStatus.UNPROCESSABLE_CONTENT);
    }

    @Test
    void aRejectedKeyIsReportedAsUnavailable() {
        status = 403;
        responseBody = "{\"error\":\"Access to this API has been disallowed\"}";

        assertThatThrownBy(() -> service.route("driving-car", List.of(new double[]{0, 0}, new double[]{1, 1})))
                .extracting(e -> ((ApiException) e).getStatus()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
    }

    @Test
    void withoutAKeyRoutesAreFlaggedStraightLineEstimates() {
        RoutingService unconfigured = service("");
        // Lisbon → Porto is ~274 km in a straight line.
        var route = unconfigured.route("driving-car", List.of(new double[]{-9.1393, 38.7223}, new double[]{-8.6291, 41.1579}));

        assertThat(route.estimated()).isTrue();
        assertThat(calls.get()).isZero();
        assertThat(route.distanceMeters()).isBetween(274_000 * 1.2, 274_000 * 1.3);
        assertThat(route.durationSeconds()).isEqualTo(route.distanceMeters() / (60 * 1000 / 3600.0));
        assertThatThrownBy(() -> unconfigured.searchPlaces("Porto", null, null))
                .extracting(e -> ((ApiException) e).getStatus()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
    }

    @Test
    void rejectsUnknownModesAndBadCoordinates() {
        assertThatThrownBy(() -> service.route("teleport", List.of(new double[]{0, 0}, new double[]{1, 1})))
                .hasMessageContaining("Travel mode");
        assertThatThrownBy(() -> service.route("driving-car", List.of(new double[]{0, 0}, new double[]{200, 1})))
                .hasMessageContaining("valid");
        assertThat(calls.get()).isZero();
    }
}
