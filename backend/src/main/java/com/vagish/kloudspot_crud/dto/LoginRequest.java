package com.vagish.kloudspot_crud.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(name = "LoginRequest", description = "Admin sign-in credentials.")
public record LoginRequest(
        @Schema(description = "Admin email", example = "admin@kloudspot.com")
        @NotBlank(message = "Email address is required")
        @Email(message = "Enter a valid email address")
        String email,

        @Schema(description = "Admin password", example = "admin123")
        @NotBlank(message = "Password is required")
        String password) {
}
