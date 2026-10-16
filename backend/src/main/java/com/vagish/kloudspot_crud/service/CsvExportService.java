package com.vagish.kloudspot_crud.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vagish.kloudspot_crud.dto.CsvResponse;
import com.vagish.kloudspot_crud.dto.EmployeeResponse;

@Service
public class CsvExportService {

    private static final String[] HEADERS = {
            "Employee ID", "Full Name", "Email", "Phone", "Department",
            "Designation", "Date of Joining", "Salary", "Status"
    };

    private final EmployeeService employeeService;

    public CsvExportService(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @Transactional(readOnly = true)
    public CsvResponse export(String search, UUID departmentId, Boolean status) {
        List<EmployeeResponse> employees = employeeService.searchAll(search, departmentId, status);

        StringBuilder csv = new StringBuilder();
        csv.append(String.join(",", HEADERS)).append('\n');

        for (EmployeeResponse e : employees) {
            csv.append(escape(e.empId())).append(',')
                    .append(escape(e.fullName())).append(',')
                    .append(escape(e.email())).append(',')
                    .append(escape(e.phoneNumber())).append(',')
                    .append(escape(e.departmentName())).append(',')
                    .append(escape(e.designation())).append(',')
                    .append(escape(e.dateOfJoining() != null ? e.dateOfJoining().toString() : "")).append(',')
                    .append(escape(e.salary() != null ? e.salary().toPlainString() : "")).append(',')
                    .append(escape(e.status() ? "Active" : "Inactive"))
                    .append('\n');
        }

        return new CsvResponse(csv.toString());
    }

    private String escape(String value) {
        if (value == null) {
            return "\"\"";
        }
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }
}
