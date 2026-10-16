package com.vagish.kloudspot_crud.config;

import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Kloudspot Employee Management API",
                version = "1.0.0",
                description = "REST API for managing employees, departments and admin accounts.",
                contact = @Contact(name = "Kloudspot", email = "manjunatha.v@kloudspot.com"),
                license = @License(name = "Proprietary")),
        security = @SecurityRequirement(name = "bearerAuth"))
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT",
        description = "Sign in via POST /api/admin/login and paste the returned token here.")
public class OpenApiConfig {
}
