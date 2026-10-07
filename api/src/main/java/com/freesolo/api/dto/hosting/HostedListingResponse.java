package com.freesolo.api.dto.hosting;

import com.freesolo.api.dto.experience.ExperienceResponse;

/** A listing the signed-in member hosts, plus how many join requests await a decision. */
public record HostedListingResponse(
        ExperienceResponse listing,
        long pendingRequests
) {}
