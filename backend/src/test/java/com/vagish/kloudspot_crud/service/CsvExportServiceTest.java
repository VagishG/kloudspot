package com.vagish.kloudspot_crud.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.vagish.kloudspot_crud.dto.CsvResponse;
import com.vagish.kloudspot_crud.dto.EmployeeResponse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CsvExportServiceTest {

    private static final String HEADER =
            "Employee ID,Full Name,Email,Phone,Department,Designation,Date of Joining,Salary,Status";

    @Mock
    private EmployeeService employeeService;

    @InjectMocks
    private CsvExportService csvExportService;

    private EmployeeResponse employee(String fullName, boolean status, String departmentName) {
        return new EmployeeResponse(
                UUID.randomUUID(),
                "EMP-1",
                fullName,
                "a@b.com",
                "9876543210",
                UUID.randomUUID(),
                departmentName,
                "Engineer",
                LocalDate.of(2024, 6, 1),
                new BigDecimal("650000"),
                status,
                UUID.randomUUID(),
                null,
                null,
                null);
    }

    @Test
    void exportWritesHeaderOnlyWhenNoEmployees() {
        when(employeeService.searchAll(isNull(), isNull(), isNull())).thenReturn(List.of());

        CsvResponse response = csvExportService.export(null, null, null);

        assertThat(response.csv()).isEqualTo(HEADER + "\n");
    }

    @Test
    void exportEscapesQuotesAndKeepsStatus() {
        when(employeeService.searchAll(any(), isNull(), any()))
                .thenReturn(List.of(employee("Aarav, \"Ace\"", true, "Engineering")));

        CsvResponse response = csvExportService.export("aarav", null, Boolean.TRUE);

        assertThat(response.csv()).contains(HEADER);
        assertThat(response.csv())
                .contains("\"Aarav, \"\"Ace\"\"\",\"a@b.com\",\"9876543210\",\"Engineering\","
                        + "\"Engineer\",\"2024-06-01\",\"650000\",\"Active\"");
    }

    @Test
    void exportRendersEmptyDepartmentAsBlankQuotedField() {
        when(employeeService.searchAll(isNull(), isNull(), isNull()))
                .thenReturn(List.of(employee("Aarav", false, null)));

        CsvResponse response = csvExportService.export(null, null, null);

        assertThat(response.csv()).contains("\"\",\"Engineer\"");
        assertThat(response.csv()).contains("\"Inactive\"");
    }
}
