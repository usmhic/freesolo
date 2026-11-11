package com.freesolo.api.service;

import com.freesolo.api.config.AppProperties;
import com.freesolo.api.dto.routing.PlaceResult;
import com.freesolo.api.dto.routing.RouteResult;
import com.freesolo.api.exception.ApiException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.time.Duration;
import java.util.*;

/**
 * Infrastructure adapter for OpenRouteService (ORS): place search
 * (Pelias-based autocomplete) and road/path directions.
 *
 * The API key never leaves the server. Without one, place search is
 * unavailable and directions fall back to a straight-line estimate flagged
 * {@code estimated}, so the planner keeps working in local development.
 */
@Service
@Slf4j
public class RoutingService {

    /** ORS profiles the planner offers, mapped to a rough speed (km/h) for straight-line estimates. */
    public static final Map<String, Double> PROFILES = Map.of(
            "driving-car", 60.0,
            "cycling-regular", 15.0,
            "cycling-mountain", 11.0,
            "foot-walking", 4.5,
            "foot-hiking", 3.5);

    /** Straight lines understate real distance; this approximates the road/path detour. */
    private static final double DETOUR_FACTOR = 1.25;
    private static final int MAX_CACHE_ENTRIES = 500;
    private static final Duration CACHE_TTL = Duration.ofMinutes(15);

    private final AppProperties props;
    private final JsonMapper jsonMapper;
    private final RestClient client;

    private record Cached<T>(T value, long at) {}

    // Small LRU caches: the planner re-asks for the same places and routes as
    // people edit, and saving a plan re-computes the route it just previewed.
    private final Map<String, Cached<List<PlaceResult>>> placeCache = lru();
    private final Map<String, Cached<RouteResult>> routeCache = lru();

    public RoutingService(AppProperties props, JsonMapper jsonMapper) {
        this.props = props;
        this.jsonMapper = jsonMapper;
        var factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofMillis(props.getOrs().getTimeoutMs()));
        factory.setReadTimeout(Duration.ofMillis(props.getOrs().getTimeoutMs()));
        this.client = RestClient.builder()
                .baseUrl(props.getOrs().getBaseUrl())
                .requestFactory(factory)
                .build();
    }

    public boolean isConfigured() {
        String key = props.getOrs().getApiKey();
        return key != null && !key.isBlank();
    }

    // ── Place search ─────────────────────────────────────────────────────────

    public List<PlaceResult> searchPlaces(String text, Double focusLat, Double focusLng) {
        String q = text == null ? "" : text.trim();
        if (q.length() < 2) return List.of();
        if (q.length() > 120) throw ApiException.badRequest("Search text is too long");
        if (!isConfigured()) throw ApiException.unavailable("Place search isn't set up on this server yet");

        String cacheKey = q.toLowerCase(Locale.ROOT) + "|" + round(focusLat) + "|" + round(focusLng);
        List<PlaceResult> hit = fromCache(placeCache, cacheKey);
        if (hit != null) return hit;

        String body = call(() -> client.get()
                .uri(b -> {
                    b.path("/geocode/autocomplete")
                            .queryParam("api_key", props.getOrs().getApiKey())
                            .queryParam("text", q)
                            .queryParam("size", 6);
                    if (focusLat != null && focusLng != null) {
                        b.queryParam("focus.point.lat", focusLat).queryParam("focus.point.lon", focusLng);
                    }
                    return b.build();
                })
                .header("Authorization", props.getOrs().getApiKey())
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .body(String.class));

        List<PlaceResult> places = parsePlaces(body);
        toCache(placeCache, cacheKey, places);
        return places;
    }

    List<PlaceResult> parsePlaces(String body) {
        List<PlaceResult> places = new ArrayList<>();
        for (JsonNode f : jsonMapper.readTree(body).path("features")) {
            JsonNode coords = f.path("geometry").path("coordinates");
            if (!coords.isArray() || coords.size() < 2) continue;
            JsonNode p = f.path("properties");
            String name = text(p, "name");
            String label = text(p, "label");
            places.add(new PlaceResult(
                    label != null ? label : name,
                    name != null ? name : label,
                    firstText(p, "locality", "county", "region"),
                    firstText(p, "country"),
                    coords.get(1).asDouble(),
                    coords.get(0).asDouble()));
        }
        return places;
    }

    // ── Directions ───────────────────────────────────────────────────────────

    /** Route through {@code coordinates} ({@code [lng, lat]} pairs, in order). */
    public RouteResult route(String profile, List<double[]> coordinates) {
        if (!PROFILES.containsKey(profile)) {
            throw ApiException.badRequest("Travel mode must be one of " + String.join(", ", new TreeSet<>(PROFILES.keySet())));
        }
        if (coordinates == null || coordinates.size() < 2) throw ApiException.badRequest("A route needs at least two stops");
        if (coordinates.size() > 25) throw ApiException.badRequest("A route can have at most 25 stops");
        for (double[] c : coordinates) {
            if (c == null || c.length != 2 || Math.abs(c[0]) > 180 || Math.abs(c[1]) > 90
                    || Double.isNaN(c[0]) || Double.isNaN(c[1])) {
                throw ApiException.badRequest("Each stop needs a valid [longitude, latitude]");
            }
        }

        if (!isConfigured()) return estimate(profile, coordinates);

        StringBuilder key = new StringBuilder(profile);
        for (double[] c : coordinates) key.append('|').append(round(c[0])).append(',').append(round(c[1]));
        RouteResult hit = fromCache(routeCache, key.toString());
        if (hit != null) return hit;

        String body = call(() -> client.post()
                .uri("/v2/directions/{profile}/geojson", profile)
                .header("Authorization", props.getOrs().getApiKey())
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON, MediaType.parseMediaType("application/geo+json"))
                .body(Map.of("coordinates", coordinates, "instructions", false))
                .retrieve()
                .body(String.class));

        RouteResult result = parseRoute(profile, body);
        toCache(routeCache, key.toString(), result);
        return result;
    }

    RouteResult parseRoute(String profile, String body) {
        JsonNode feature = jsonMapper.readTree(body).path("features").path(0);
        JsonNode line = feature.path("geometry").path("coordinates");
        if (!line.isArray() || line.isEmpty()) throw ApiException.badGateway("The routing service returned no route");

        List<double[]> coords = new ArrayList<>(line.size());
        for (JsonNode c : line) coords.add(new double[]{c.get(0).asDouble(), c.get(1).asDouble()});

        JsonNode properties = feature.path("properties");
        List<RouteResult.Leg> legs = new ArrayList<>();
        for (JsonNode s : properties.path("segments")) {
            legs.add(new RouteResult.Leg(s.path("distance").asDouble(), s.path("duration").asDouble()));
        }
        JsonNode summary = properties.path("summary");
        double distance = summary.path("distance").asDouble(legs.stream().mapToDouble(RouteResult.Leg::distanceMeters).sum());
        double duration = summary.path("duration").asDouble(legs.stream().mapToDouble(RouteResult.Leg::durationSeconds).sum());
        return new RouteResult(profile, distance, duration, coords, legs, false);
    }

    /** Straight lines between stops at a typical speed for the mode — used when ORS isn't configured. */
    RouteResult estimate(String profile, List<double[]> coordinates) {
        double speedMs = PROFILES.get(profile) * 1000 / 3600;
        List<RouteResult.Leg> legs = new ArrayList<>();
        double total = 0;
        for (int i = 1; i < coordinates.size(); i++) {
            double d = haversineMeters(coordinates.get(i - 1), coordinates.get(i)) * DETOUR_FACTOR;
            legs.add(new RouteResult.Leg(d, d / speedMs));
            total += d;
        }
        return new RouteResult(profile, total, total / speedMs, List.copyOf(coordinates), legs, true);
    }

    static double haversineMeters(double[] a, double[] b) {
        double r = 6_371_000;
        double dLat = Math.toRadians(b[1] - a[1]);
        double dLng = Math.toRadians(b[0] - a[0]);
        double h = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(a[1])) * Math.cos(Math.toRadians(b[1])) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return 2 * r * Math.asin(Math.min(1, Math.sqrt(h)));
    }

    // ── Plumbing ─────────────────────────────────────────────────────────────

    private interface Call { String run(); }

    private String call(Call call) {
        try {
            return call.run();
        } catch (RestClientResponseException e) {
            throw translate(e.getStatusCode(), e.getResponseBodyAsString());
        } catch (RestClientException e) {
            log.warn("OpenRouteService unreachable: {}", e.getMessage());
            throw ApiException.badGateway("The routing service didn't respond — try again in a moment");
        }
    }

    ApiException translate(HttpStatusCode status, String body) {
        String message = null;
        try {
            message = text(jsonMapper.readTree(body).path("error"), "message");
        } catch (RuntimeException ignored) {
            // non-JSON error body
        }
        log.warn("OpenRouteService {}: {}", status.value(), message != null ? message : body);
        if (status.value() == 401 || status.value() == 403) {
            return ApiException.unavailable("The routing service rejected this server's key");
        }
        if (status.value() == 429) {
            return ApiException.tooManyRequests("Routing is busy right now — try again in a minute");
        }
        if (status.is4xxClientError() && message != null && message.toLowerCase(Locale.ROOT).contains("routable point")) {
            return ApiException.unprocessable("One of the stops can't be reached with this travel mode. Move it closer to a road or path, or switch modes.");
        }
        if (status.is4xxClientError()) {
            return ApiException.unprocessable(message != null ? message : "The routing service couldn't plan this route");
        }
        return ApiException.badGateway("The routing service had a problem — try again in a moment");
    }

    private static String text(JsonNode node, String field) {
        JsonNode v = node.path(field);
        return v.isMissingNode() || v.isNull() ? null : v.asString();
    }

    private static String firstText(JsonNode node, String... fields) {
        for (String f : fields) {
            String v = text(node, f);
            if (v != null && !v.isBlank()) return v;
        }
        return null;
    }

    private static String round(Double v) {
        return v == null ? "-" : String.format(Locale.ROOT, "%.5f", v);
    }

    private static <T> Map<String, Cached<T>> lru() {
        return Collections.synchronizedMap(new LinkedHashMap<>(64, 0.75f, true) {
            @Override
            protected boolean removeEldestEntry(Map.Entry<String, Cached<T>> eldest) {
                return size() > MAX_CACHE_ENTRIES;
            }
        });
    }

    private static <T> T fromCache(Map<String, Cached<T>> cache, String key) {
        Cached<T> c = cache.get(key);
        if (c == null) return null;
        if (System.currentTimeMillis() - c.at() > CACHE_TTL.toMillis()) {
            cache.remove(key);
            return null;
        }
        return c.value();
    }

    private static <T> void toCache(Map<String, Cached<T>> cache, String key, T value) {
        cache.put(key, new Cached<>(value, System.currentTimeMillis()));
    }
}
