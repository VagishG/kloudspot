package com.vagish.kloudspot_crud.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vagish.kloudspot_crud.dto.LoginRequest;
import com.vagish.kloudspot_crud.dto.LoginResponse;
import com.vagish.kloudspot_crud.exception.UnauthorizedException;
import com.vagish.kloudspot_crud.model.Admin;
import com.vagish.kloudspot_crud.repository.AdminRepository;
import com.vagish.kloudspot_crud.security.JwtService;

import com.vagish.kloudspot_crud.dto.AdminResponse;

@Service
public class AuthService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(AdminRepository adminRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        Admin admin = adminRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), admin.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String token = jwtService.generateToken(admin.getId(), admin.getEmail());
        return new LoginResponse(token, AdminResponse.from(admin));
    }
}
