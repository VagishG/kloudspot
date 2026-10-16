package com.vagish.kloudspot_crud.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import com.vagish.kloudspot_crud.model.Employee;

public record EmployeeResponse(
        UUID id,
        String empId,
        String fullName,
        String email,
        String phoneNumber,
        UUID departmentId,
        String departmentName,
        String designation,
        LocalDate dateOfJoining,
        BigDecimal salary,
        boolean status,
        UUID createdBy,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        UUID updatedBy) {

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
