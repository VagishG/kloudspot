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

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/emp")
public class EmployeeController {

    private final EmployeeService employeeService;
    private final CsvExportService csvExportService;

    public EmployeeController(EmployeeService employeeService, CsvExportService csvExportService) {
        this.employeeService = employeeService;
        this.csvExportService = csvExportService;
    }

    @GetMapping
    public PageResponse<EmployeeResponse> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID department,
            @RequestParam(required = false) String status) {
        return employeeService.list(page, size, search, department, parseStatus(status));
    }

    @GetMapping("/{id}")
    public EmployeeResponse get(@PathVariable UUID id) {
        return employeeService.getById(id);
    }

    @PostMapping("/add")
    @ResponseStatus(HttpStatus.CREATED)
    public EmployeeResponse create(@Valid @RequestBody EmployeeRequest request) {
        return employeeService.create(request);
    }

    @PatchMapping("/{id}")
    public EmployeeResponse update(@PathVariable UUID id, @Valid @RequestBody EmployeeRequest request) {
        return employeeService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        employeeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/export")
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
