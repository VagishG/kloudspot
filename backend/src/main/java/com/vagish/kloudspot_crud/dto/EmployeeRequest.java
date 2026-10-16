package com.vagish.kloudspot_crud.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record EmployeeRequest(
        @NotBlank(message = "Employee ID is required")
        String empId,

        @NotBlank(message = "Full name is required")
        String fullName,

        @NotBlank(message = "Email address is required")
        @Email(message = "Enter a valid email address")
        String email,

        @NotBlank(message = "Phone number is required")
        String phoneNumber,

        @NotNull(message = "Department is required")
        UUID departmentId,

        @NotBlank(message = "Designation is required")
        String designation,

        @NotNull(message = "Date of joining is required")
        LocalDate dateOfJoining,

        @NotNull(message = "Salary is required")
        @Positive(message = "Salary must be greater than 0")
        BigDecimal salary,

        boolean status) {
}
