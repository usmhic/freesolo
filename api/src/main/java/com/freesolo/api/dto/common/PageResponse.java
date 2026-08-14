package com.freesolo.api.dto.common;

import java.util.List;

public record PageResponse<T>(
        List<T> data,
        long total,
        int page,
        int limit,
        int pages
) {
    public static <T> PageResponse<T> of(List<T> data, long total, int page, int limit) {
        int pages = (int) Math.ceil((double) total / limit);
        return new PageResponse<>(data, total, page, limit, pages);
    }
}
