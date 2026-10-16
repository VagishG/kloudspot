package com.vagish.kloudspot_crud.dto;

import java.util.Map;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "ErrorResponse", description = "Standard error body.")
public record ErrorResponse(
        @Schema(description = "Human readable error message") String message,
        @Schema(description = "Field level validation errors, keyed by field name") Map<String, String> fieldErrors) {

    public ErrorResponse(String message) {
        this(message, null);
    }
}
