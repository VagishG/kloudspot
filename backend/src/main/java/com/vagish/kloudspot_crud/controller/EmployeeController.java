package com.vagish.kloudspot_crud.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.vagish.kloudspot_crud.dto.CsvResponse;
import com.vagish.kloudspot_crud.dto.EmployeeRequest;
import com.vagish.kloudspot_crud.dto.EmployeeResponse;
import com.vagish.kloudspot_crud.dto.PageResponse;
import com.vagish.kloudspot_crud.service.CsvExportService;
import com.vagish.kloudspot_crud.service.EmployeeService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/emp")
@Tag(name = "Employees", description = "Create, read, update, delete, search and export employee records.")
public class EmployeeController {

    private final EmployeeService employeeService;
    private final CsvExportService csvExportService;

    public EmployeeController(EmployeeService employeeService, CsvExportService csvExportService) {
        this.employeeService = employeeService;
        this.csvExportService = csvExportService;
    }

    @GetMapping
    @Operation(summary = "List employees", description = "Paginated, filtered list of employees sorted by name.")
    public PageResponse<EmployeeResponse> list(
            @Parameter(description = "1-based page number") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "Page size (max 100)") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Matches full name or email") @RequestParam(required = false) String search,
            @Parameter(description = "Filter by department id") @RequestParam(required = false) UUID department,
            @Parameter(description = "active or inactive") @RequestParam(required = false) String status) {
        return employeeService.list(page, size, search, department, parseStatus(status));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get an employee by id")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Employee found"),
            @ApiResponse(responseCode = "404", description = "Employee not found")})
    public EmployeeResponse get(@PathVariable UUID id) {
        return employeeService.getById(id);
    }

    @PostMapping("/add")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create an employee")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Employee created"),
            @ApiResponse(responseCode = "400", description = "Validation failed"),
            @ApiResponse(responseCode = "409", description = "Employee ID or email already exists")})
    public EmployeeResponse create(@Valid @RequestBody EmployeeRequest request) {
        return employeeService.create(request);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update an employee", description = "Replaces the editable fields of an existing employee.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Employee updated"),
            @ApiResponse(responseCode = "404", description = "Employee not found"),
            @ApiResponse(responseCode = "409", description = "Employee ID or email already exists")})
    public EmployeeResponse update(@PathVariable UUID id, @Valid @RequestBody EmployeeRequest request) {
        return employeeService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete an employee")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Employee deleted"),
            @ApiResponse(responseCode = "404", description = "Employee not found")})
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        employeeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/export")
    @Operation(summary = "Export employees as CSV", description = "Returns the filtered employees as a CSV string.")
    public CsvResponse export(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID department,
            @RequestParam(required = false) String status) {
        return csvExportService.export(search, department, parseStatus(status));
    }

    private Boolean parseStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        return switch (status.trim().toLowerCase()) {
            case "active" -> Boolean.TRUE;
            case "inactive" -> Boolean.FALSE;
            default -> null;
        };
    }
}
