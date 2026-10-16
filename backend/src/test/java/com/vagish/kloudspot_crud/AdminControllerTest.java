package com.vagish.kloudspot_crud;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AdminControllerTest extends BaseIntegrationTest {

    @Test
    void listAdminsRequiresAuth() throws Exception {
        mockMvc.perform(get("/api/admins"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void listAdminsNeverExposesPasswords() throws Exception {
        String token = loginAsBootstrapAdmin();

        mockMvc.perform(withAuth(get("/api/admins"), token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("admin@kloudspot.com"))
                .andExpect(jsonPath("$[0].password").doesNotExist());
    }

    @Test
    void createAdminRequiresAuth() throws Exception {
        mockMvc.perform(post("/api/admins")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("name", "Second", "email", "second@kloudspot.com", "password", "password123"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createAdminWithValidTokenSucceeds() throws Exception {
        String token = loginAsBootstrapAdmin();

        mockMvc.perform(withAuth(post("/api/admins"), token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("name", "Second", "email", "second@kloudspot.com", "password", "password123"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.email").value("second@kloudspot.com"))
                .andExpect(jsonPath("$.password").doesNotExist());

        mockMvc.perform(post("/api/admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("email", "second@kloudspot.com", "password", "password123"))))
                .andExpect(status().isOk());
    }

    @Test
    void createAdminWithDuplicateEmailReturns409() throws Exception {
        String token = loginAsBootstrapAdmin();

        mockMvc.perform(withAuth(post("/api/admins"), token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("name", "Dup", "email", "admin@kloudspot.com", "password", "password123"))))
                .andExpect(status().isConflict());
    }

    @Test
    void createAdminWithShortPasswordReturns400FieldErrors() throws Exception {
        String token = loginAsBootstrapAdmin();

        mockMvc.perform(withAuth(post("/api/admins"), token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("name", "Short", "email", "short@kloudspot.com", "password", "abc"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.password").exists());
    }
}
