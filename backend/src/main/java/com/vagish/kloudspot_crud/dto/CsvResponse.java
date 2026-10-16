package com.vagish.kloudspot_crud.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "CsvResponse", description = "CSV export of the matching employees.")
public record CsvResponse(
        @Schema(description = "Comma separated values") String csv) {
}
