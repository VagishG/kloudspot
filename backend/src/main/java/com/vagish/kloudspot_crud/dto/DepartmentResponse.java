package com.vagish.kloudspot_crud.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.vagish.kloudspot_crud.model.Department;

public record DepartmentResponse(UUID id, String name, LocalDateTime createdAt) {

    public static DepartmentResponse from(Department department) {
        return new DepartmentResponse(department.getId(), department.getName(), department.getCreatedAt());
    }
}
