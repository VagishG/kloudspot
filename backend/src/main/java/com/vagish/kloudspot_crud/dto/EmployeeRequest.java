package com.vagish.kloudspot_crud.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Schema(name = "EmployeeRequest", description = "Payload for creating or updating an employee.")
public record EmployeeRequest(
        @Schema(description = "Unique employee code", example = "EMP-1001")
        @NotBlank(message = "Employee ID is required")
        String empId,

        @Schema(description = "Full name of the employee", example = "Aarav Sharma")
        @NotBlank(message = "Full name is required")
        String fullName,

        @Schema(description = "Work email address", example = "aarav.sharma@kloudspot.com")
        @NotBlank(message = "Email address is required")
        @Email(message = "Enter a valid email address")
        String email,

        @Schema(description = "Contact phone number (10-15 digits)", example = "9876543210")
        @NotBlank(message = "Phone number is required")
        String phoneNumber,

        @Schema(description = "Department id the employee belongs to")
        @NotNull(message = "Department is required")
        UUID departmentId,

        @Schema(description = "Job title", example = "Software Engineer")
        @NotBlank(message = "Designation is required")
        String designation,

        @Schema(description = "Date of joining (ISO-8601)", example = "2024-06-01")
        @NotNull(message = "Date of joining is required")
        LocalDate dateOfJoining,

        @Schema(description = "Annual salary", example = "650000")
        @NotNull(message = "Salary is required")
        @Positive(message = "Salary must be greater than 0")
        BigDecimal salary,

        @Schema(description = "Employment status: true for Active, false for Inactive", example = "true")
        boolean status) {
}
