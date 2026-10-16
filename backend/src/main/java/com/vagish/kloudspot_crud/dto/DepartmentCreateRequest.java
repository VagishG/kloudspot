package com.vagish.kloudspot_crud.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(name = "DepartmentCreateRequest", description = "Payload for creating a department.")
public record DepartmentCreateRequest(
        @Schema(description = "Department name", example = "Engineering")
        @NotBlank(message = "Department name is required")
        String name) {
}
