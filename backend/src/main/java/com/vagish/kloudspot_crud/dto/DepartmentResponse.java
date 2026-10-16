package com.vagish.kloudspot_crud.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.vagish.kloudspot_crud.model.Department;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "DepartmentResponse", description = "A department record.")
public record DepartmentResponse(
        @Schema(description = "Department id") UUID id,
        @Schema(description = "Department name") String name,
        @Schema(description = "Creation timestamp") LocalDateTime createdAt) {

    public static DepartmentResponse from(Department department) {
        return new DepartmentResponse(department.getId(), department.getName(), department.getCreatedAt());
    }
}
