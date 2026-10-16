package com.vagish.kloudspot_crud.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vagish.kloudspot_crud.dto.LoginRequest;
import com.vagish.kloudspot_crud.dto.LoginResponse;
import com.vagish.kloudspot_crud.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
