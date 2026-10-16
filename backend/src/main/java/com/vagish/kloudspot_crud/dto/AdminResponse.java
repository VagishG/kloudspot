package com.vagish.kloudspot_crud.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.vagish.kloudspot_crud.model.Admin;

public record AdminResponse(UUID id, String name, String email, LocalDateTime createdAt) {

    public static AdminResponse from(Admin admin) {
        return new AdminResponse(admin.getId(), admin.getName(), admin.getEmail(), admin.getCreatedAt());
    }
}
