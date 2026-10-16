package com.vagish.kloudspot_crud.dto;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "PageResponse", description = "A single page of results.")
public record PageResponse<T>(
        @Schema(description = "Records on this page") List<T> data,
        @Schema(description = "Total number of matching records") long total,
        @Schema(description = "Current 1-based page number") int page,
        @Schema(description = "Page size") int size) {
}
