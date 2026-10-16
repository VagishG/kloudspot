package com.vagish.kloudspot_crud;

import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import tools.jackson.databind.JsonNode;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class EmployeeControllerTest extends BaseIntegrationTest {

    private Map<String, Object> employeePayload(UUID departmentId) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("empId", "KS-1001");
        body.put("fullName", "Aarav Sharma");
        body.put("email", "aarav.sharma@kloudspot.com");
        body.put("phoneNumber", "+91 9876543210");
        body.put("departmentId", departmentId.toString());
        body.put("designation", "Software Engineer");
        body.put("dateOfJoining", "2024-01-15");
        body.put("salary", 650000);
        body.put("status", true);
        return body;
    }

    private JsonNode createEmployee(String token, Map<String, Object> payload) throws Exception {
        MvcResult result = mockMvc.perform(withAuth(post("/api/emp/add"), token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString(StandardCharsets.UTF_8));
    }

    @Test
    void listRequiresAuth() throws Exception {
        mockMvc.perform(get("/api/emp"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createEmployeeReturnsFrontendShape() throws Exception {
        String token = loginAsBootstrapAdmin();
        UUID deptId = createDepartment(token, "Engineering");

        mockMvc.perform(withAuth(post("/api/emp/add"), token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(employeePayload(deptId))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.empId").value("KS-1001"))
                .andExpect(jsonPath("$.fullName").value("Aarav Sharma"))
                .andExpect(jsonPath("$.departmentId").value(deptId.toString()))
                .andExpect(jsonPath("$.departmentName").value("Engineering"))
                .andExpect(jsonPath("$.status").value(true))
                .andExpect(jsonPath("$.salary").value(650000))
                .andExpect(jsonPath("$.createdBy").isNotEmpty())
                .andExpect(jsonPath("$.createdAt").isNotEmpty());
    }

    @Test
    void getEmployeeById() throws Exception {
        String token = loginAsBootstrapAdmin();
        UUID deptId = createDepartment(token, "Engineering");
        UUID id = UUID.fromString(createEmployee(token, employeePayload(deptId)).get("id").asText());

        mockMvc.perform(withAuth(get("/api/emp/" + id), token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.email").value("aarav.sharma@kloudspot.com"));
    }

    @Test
    void getUnknownEmployeeReturns404() throws Exception {
        String token = loginAsBootstrapAdmin();

        mockMvc.perform(withAuth(get("/api/emp/" + UUID.randomUUID()), token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Employee not found"));
    }

    @Test
    void listReturnsPaginationEnvelopeExpectedByFrontend() throws Exception {
        String token = loginAsBootstrapAdmin();
        UUID deptId = createDepartment(token, "Engineering");

        for (int i = 0; i < 3; i++) {
            Map<String, Object> payload = employeePayload(deptId);
            payload.put("empId", "KS-200" + i);
            payload.put("email", "emp" + i + "@kloudspot.com");
            payload.put("fullName", "Employee " + i);
            createEmployee(token, payload);
        }

        mockMvc.perform(withAuth(get("/api/emp?page=1&size=2"), token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.total").value(3))
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.size").value(2))
                .andExpect(jsonPath("$.content").doesNotExist())
                .andExpect(jsonPath("$.totalElements").doesNotExist());

        mockMvc.perform(withAuth(get("/api/emp?page=2&size=2"), token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1));
    }

    @Test
    void searchMatchesNameEmailAndEmpId() throws Exception {
        String token = loginAsBootstrapAdmin();
        UUID deptId = createDepartment(token, "Engineering");
        createEmployee(token, employeePayload(deptId));

        mockMvc.perform(withAuth(get("/api/emp?search=aarav"), token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1));

        mockMvc.perform(withAuth(get("/api/emp?search=KS-1001"), token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1));

        mockMvc.perform(withAuth(get("/api/emp?search=aarav.sharma@"), token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1));

        mockMvc.perform(withAuth(get("/api/emp?search=nobody"), token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(0));
    }

    @Test
    void filterByDepartmentAndStatus() throws Exception {
        String token = loginAsBootstrapAdmin();
        UUID engineering = createDepartment(token, "Engineering");
        UUID sales = createDepartment(token, "Sales");

        Map<String, Object> active = employeePayload(engineering);
        active.put("empId", "KS-1");
        active.put("email", "active@kloudspot.com");
        active.put("status", true);
        createEmployee(token, active);

        Map<String, Object> inactive = employeePayload(sales);
        inactive.put("empId", "KS-2");
        inactive.put("email", "inactive@kloudspot.com");
        inactive.put("status", false);
        createEmployee(token, inactive);

        mockMvc.perform(withAuth(get("/api/emp?department=" + engineering), token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.data[0].empId").value("KS-1"));

        mockMvc.perform(withAuth(get("/api/emp?status=active"), token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.data[0].empId").value("KS-1"));

        mockMvc.perform(withAuth(get("/api/emp?status=inactive"), token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.data[0].empId").value("KS-2"));

        mockMvc.perform(withAuth(get("/api/emp?search=active&department=" + engineering + "&status=active"), token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1));
    }

    @Test
    void updateEmployeeChangesFields() throws Exception {
        String token = loginAsBootstrapAdmin();
        UUID deptId = createDepartment(token, "Engineering");
        UUID id = UUID.fromString(createEmployee(token, employeePayload(deptId)).get("id").asText());

        Map<String, Object> update = employeePayload(deptId);
        update.put("fullName", "Aarav S Sharma");
        update.put("status", false);
        update.put("salary", 900000);

        mockMvc.perform(withAuth(patch("/api/emp/" + id), token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Aarav S Sharma"))
                .andExpect(jsonPath("$.status").value(false))
                .andExpect(jsonPath("$.salary").value(900000))
                .andExpect(jsonPath("$.updatedBy").isNotEmpty());
    }

    @Test
    void deleteEmployeeRemovesIt() throws Exception {
        String token = loginAsBootstrapAdmin();
        UUID deptId = createDepartment(token, "Engineering");
        UUID id = UUID.fromString(createEmployee(token, employeePayload(deptId)).get("id").asText());

        mockMvc.perform(withAuth(delete("/api/emp/" + id), token))
                .andExpect(status().isNoContent());

        mockMvc.perform(withAuth(get("/api/emp/" + id), token))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteUnknownEmployeeReturns404() throws Exception {
        String token = loginAsBootstrapAdmin();

        mockMvc.perform(withAuth(delete("/api/emp/" + UUID.randomUUID()), token))
                .andExpect(status().isNotFound());
    }

    @Test
    void duplicateEmpIdReturns409() throws Exception {
        String token = loginAsBootstrapAdmin();
        UUID deptId = createDepartment(token, "Engineering");
        createEmployee(token, employeePayload(deptId));

        Map<String, Object> dup = employeePayload(deptId);
        dup.put("email", "other@kloudspot.com");

        mockMvc.perform(withAuth(post("/api/emp/add"), token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dup)))
                .andExpect(status().isConflict());
    }

    @Test
    void duplicateEmailReturns409() throws Exception {
        String token = loginAsBootstrapAdmin();
        UUID deptId = createDepartment(token, "Engineering");
        createEmployee(token, employeePayload(deptId));

        Map<String, Object> dup = employeePayload(deptId);
        dup.put("empId", "KS-9999");

        mockMvc.perform(withAuth(post("/api/emp/add"), token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dup)))
                .andExpect(status().isConflict());
    }

    @Test
    void unknownDepartmentReturns404() throws Exception {
        String token = loginAsBootstrapAdmin();

        mockMvc.perform(withAuth(post("/api/emp/add"), token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(employeePayload(UUID.randomUUID()))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Department not found"));
    }

    @Test
    void validationErrorsReturnFieldErrors() throws Exception {
        String token = loginAsBootstrapAdmin();
        UUID deptId = createDepartment(token, "Engineering");

        Map<String, Object> invalid = employeePayload(deptId);
        invalid.put("empId", "");
        invalid.put("email", "not-an-email");
        invalid.put("salary", -5);

        mockMvc.perform(withAuth(post("/api/emp/add"), token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.empId").exists())
                .andExpect(jsonPath("$.fieldErrors.email").exists())
                .andExpect(jsonPath("$.fieldErrors.salary").exists());
    }

    @Test
    void invalidPhoneReturnsFieldError() throws Exception {
        String token = loginAsBootstrapAdmin();
        UUID deptId = createDepartment(token, "Engineering");

        Map<String, Object> invalid = employeePayload(deptId);
        invalid.put("phoneNumber", "123");

        mockMvc.perform(withAuth(post("/api/emp/add"), token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.phoneNumber").exists());
    }

    @Test
    void exportReturnsCsvJson() throws Exception {
        String token = loginAsBootstrapAdmin();
        UUID deptId = createDepartment(token, "Engineering");
        createEmployee(token, employeePayload(deptId));

        MvcResult result = mockMvc.perform(withAuth(get("/api/emp/export"), token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.csv").isNotEmpty())
                .andReturn();

        String csv = objectMapper.readTree(result.getResponse().getContentAsString(StandardCharsets.UTF_8))
                .get("csv").asText();

        if (!csv.startsWith("Employee ID,Full Name,Email,Phone,Department,Designation,Date of Joining,Salary,Status")) {
            throw new AssertionError("Unexpected CSV header: " + csv.lines().findFirst().orElse(""));
        }
        if (!csv.contains("\"KS-1001\"") || !csv.contains("\"Active\"")) {
            throw new AssertionError("CSV missing expected row data:\n" + csv);
        }
    }

    @Test
    void exportIsFilteredAndIgnoresMissingPagination() throws Exception {
        String token = loginAsBootstrapAdmin();
        UUID engineering = createDepartment(token, "Engineering");
        UUID sales = createDepartment(token, "Sales");

        Map<String, Object> first = employeePayload(engineering);
        first.put("empId", "KS-1");
        first.put("email", "first@kloudspot.com");
        createEmployee(token, first);

        Map<String, Object> second = employeePayload(sales);
        second.put("empId", "KS-2");
        second.put("email", "second@kloudspot.com");
        createEmployee(token, second);

        MvcResult result = mockMvc.perform(withAuth(get("/api/emp/export?department=" + engineering), token))
                .andExpect(status().isOk())
                .andReturn();

        String csv = objectMapper.readTree(result.getResponse().getContentAsString(StandardCharsets.UTF_8))
                .get("csv").asText();

        if (!csv.contains("KS-1") || csv.contains("KS-2")) {
            throw new AssertionError("Export did not respect department filter:\n" + csv);
        }
    }

    @Test
    void paginationDefaultsAreApplied() throws Exception {
        String token = loginAsBootstrapAdmin();
        UUID deptId = createDepartment(token, "Engineering");
        createEmployee(token, employeePayload(deptId));

        mockMvc.perform(withAuth(get("/api/emp"), token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.size").value(10));
    }

    @Test
    void oversizedPageSizeIsCapped() throws Exception {
        String token = loginAsBootstrapAdmin();
        UUID deptId = createDepartment(token, "Engineering");
        createEmployee(token, employeePayload(deptId));

        mockMvc.perform(withAuth(get("/api/emp?page=1&size=100000"), token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size").value(100));
    }
}
