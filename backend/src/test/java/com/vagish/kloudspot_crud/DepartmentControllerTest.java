package com.vagish.kloudspot_crud;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class DepartmentControllerTest extends BaseIntegrationTest {

    @Test
    void listRequiresAuth() throws Exception {
        mockMvc.perform(get("/api/departments"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createAndListDepartments() throws Exception {
        String token = loginAsBootstrapAdmin();

        mockMvc.perform(withAuth(post("/api/departments"), token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("name", "Engineering"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.name").value("Engineering"));

        mockMvc.perform(withAuth(get("/api/departments"), token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Engineering"));
    }

    @Test
    void duplicateDepartmentNameReturns409() throws Exception {
        String token = loginAsBootstrapAdmin();
        createDepartment(token, "Engineering");

        mockMvc.perform(withAuth(post("/api/departments"), token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("name", "engineering"))))
                .andExpect(status().isConflict());
    }

    @Test
    void blankDepartmentNameReturns400() throws Exception {
        String token = loginAsBootstrapAdmin();

        mockMvc.perform(withAuth(post("/api/departments"), token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("name", "   "))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.name").exists());
    }
}
