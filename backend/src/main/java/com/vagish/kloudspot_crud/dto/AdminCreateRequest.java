package com.vagish.kloudspot_crud.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(name = "AdminCreateRequest", description = "Payload for creating an admin account.")
public record AdminCreateRequest(
        @Schema(description = "Admin display name", example = "Priya Nair")
        @NotBlank(message = "Name is required")
        String name,

        @Schema(description = "Unique admin email", example = "priya.nair@kloudspot.com")
        @NotBlank(message = "Email address is required")
        @Email(message = "Enter a valid email address")
        String email,

        @Schema(description = "Password, minimum 8 characters")
        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Use at least 8 characters")
        String password) {
}
