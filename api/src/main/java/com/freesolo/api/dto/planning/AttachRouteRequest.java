package com.freesolo.api.dto.planning;

import jakarta.validation.constraints.NotBlank;

/** Copies the route of one of the host's plans onto one of their listings. */
public record AttachRouteRequest(@NotBlank String planId) {}
