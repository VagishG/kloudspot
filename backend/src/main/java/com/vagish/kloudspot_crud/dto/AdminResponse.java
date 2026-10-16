package com.vagish.kloudspot_crud.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.vagish.kloudspot_crud.model.Admin;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "AdminResponse", description = "An admin account.")
public record AdminResponse(
        @Schema(description = "Admin id") UUID id,
        @Schema(description = "Admin name") String name,
        @Schema(description = "Admin email") String email,
        @Schema(description = "Creation timestamp") LocalDateTime createdAt) {

    public static AdminResponse from(Admin admin) {
        return new AdminResponse(admin.getId(), admin.getName(), admin.getEmail(), admin.getCreatedAt());
    }
}
