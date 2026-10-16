package com.vagish.kloudspot_crud;

import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import com.vagish.kloudspot_crud.model.Admin;
import com.vagish.kloudspot_crud.repository.AdminRepository;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class BaseIntegrationTest {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @Autowired
    protected JdbcTemplate jdbc;

    @Autowired
    protected AdminRepository adminRepository;

    @Autowired
    protected PasswordEncoder passwordEncoder;

    @BeforeEach
    void resetAndSeed() {
        resetTables();
        seedBootstrapAdmin();
    }

    protected void seedBootstrapAdmin() {
        Admin admin = new Admin();
        admin.setName("Admin");
        admin.setEmail("admin@kloudspot.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        adminRepository.save(admin);
    }

    protected String loginAsBootstrapAdmin() throws Exception {
        return login("admin@kloudspot.com", "admin123");
    }

    protected String login(String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("email", email, "password", password))))
                .andReturn();
        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString(StandardCharsets.UTF_8));
        return json.get("token").asText();
    }

    protected MockHttpServletRequestBuilder withAuth(MockHttpServletRequestBuilder builder, String token) {
        return builder.header("Authorization", "Bearer " + token);
    }

    protected UUID createDepartment(String token, String name) throws Exception {
        MvcResult result = mockMvc.perform(withAuth(post("/api/departments"), token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("name", name))))
                .andReturn();
        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString(StandardCharsets.UTF_8));
        return UUID.fromString(json.get("id").asText());
    }

    protected void resetTables() {
        jdbc.execute("DELETE FROM employees");
        jdbc.execute("DELETE FROM departments");
        jdbc.execute("DELETE FROM admins");
    }
}
