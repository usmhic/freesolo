package com.freesolo.api.dto.stripe;

import jakarta.validation.constraints.NotBlank;

public record PaymentIntentRequest(
        @NotBlank String bookingId,
        String paymentMethodId
) {}
