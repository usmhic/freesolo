package com.freesolo.api.dto.chat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PostGroupMessageRequest(
        @NotBlank @Size(max = 2000, message = "Messages are limited to 2000 characters") String body
) {}
