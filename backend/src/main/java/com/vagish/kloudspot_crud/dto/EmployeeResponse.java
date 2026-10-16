package com.vagish.kloudspot_crud.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import com.vagish.kloudspot_crud.model.Employee;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "EmployeeResponse", description = "An employee record.")
public record EmployeeResponse(
        @Schema(description = "Employee id") UUID id,
        @Schema(description = "Employee code") String empId,
        @Schema(description = "Full name") String fullName,
        @Schema(description = "Email address") String email,
        @Schema(description = "Phone number") String phoneNumber,
        @Schema(description = "Department id") UUID departmentId,
        @Schema(description = "Department name") String departmentName,
        @Schema(description = "Job title") String designation,
        @Schema(description = "Date of joining") LocalDate dateOfJoining,
        @Schema(description = "Annual salary") BigDecimal salary,
        @Schema(description = "Employment status") boolean status,
        @Schema(description = "Admin id that created the record") UUID createdBy,
        @Schema(description = "Creation timestamp") LocalDateTime createdAt,
        @Schema(description = "Last update timestamp") LocalDateTime updatedAt,
        @Schema(description = "Admin id that last updated the record") UUID updatedBy) {

    public static EmployeeResponse from(Employee employee) {
        return new EmployeeResponse(
                employee.getId(),
                employee.getEmpId(),
                employee.getFullName(),
                employee.getEmail(),
                employee.getPhoneNumber(),
                employee.getDepartment() != null ? employee.getDepartment().getId() : null,
                employee.getDepartment() != null ? employee.getDepartment().getName() : null,
                employee.getDesignation(),
                employee.getDateOfJoining(),
                employee.getSalary(),
                employee.isStatus(),
                employee.getCreatedBy() != null ? employee.getCreatedBy().getId() : null,
                employee.getCreatedAt(),
                employee.getUpdatedAt(),
                employee.getUpdatedBy() != null ? employee.getUpdatedBy().getId() : null);
    }
}
