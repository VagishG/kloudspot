package com.vagish.kloudspot_crud.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminCreateRequest(
        @NotBlank(message = "Name is required")
        String name,

        @NotBlank(message = "Email address is required")
        @Email(message = "Enter a valid email address")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Use at least 8 characters")
        String password) {
}
