package com.vagish.kloudspot_crud.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "LoginResponse", description = "Issued JWT and the signed-in admin.")
public record LoginResponse(
        @Schema(description = "JWT bearer token") String token,
        @Schema(description = "Signed-in admin") AdminResponse admin) {
}
