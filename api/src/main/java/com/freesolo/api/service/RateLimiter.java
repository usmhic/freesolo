package com.freesolo.api.service;

import com.freesolo.api.exception.ApiException;
import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Fixed one-minute windows per client and bucket. Enough to stop one client
 * from draining a shared third-party quota (OpenRouteService); not a general
 * abuse defence, and per instance only.
 */
@Component
public class RateLimiter {

    private record Window(long minute, AtomicInteger count) {}

    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();

    public void check(String bucket, String clientKey, int perMinute) {
        long minute = System.currentTimeMillis() / 60_000;
        String key = bucket + ":" + clientKey;
        Window w = windows.compute(key, (k, old) ->
                old == null || old.minute() != minute ? new Window(minute, new AtomicInteger()) : old);
        if (w.count().incrementAndGet() > perMinute) {
            throw ApiException.tooManyRequests("Too many requests — wait a moment and try again");
        }
        if (windows.size() > 50_000) windows.entrySet().removeIf(e -> e.getValue().minute() != minute);
    }
}
