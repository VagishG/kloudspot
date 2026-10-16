package com.vagish.kloudspot_crud.dto;

import jakarta.validation.constraints.NotBlank;

public record DepartmentCreateRequest(
        @NotBlank(message = "Department name is required")
        String name) {
}
