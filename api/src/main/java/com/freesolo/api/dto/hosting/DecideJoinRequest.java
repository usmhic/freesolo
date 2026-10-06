package com.freesolo.api.dto.hosting;

import jakarta.validation.constraints.Size;

/** Optional note sent to the traveler with an approval or a decline. */
public record DecideJoinRequest(@Size(max = 500) String note) {}
