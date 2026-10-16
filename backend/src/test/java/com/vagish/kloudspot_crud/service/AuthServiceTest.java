package com.vagish.kloudspot_crud.service;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.vagish.kloudspot_crud.dto.LoginRequest;
import com.vagish.kloudspot_crud.dto.LoginResponse;
import com.vagish.kloudspot_crud.exception.UnauthorizedException;
import com.vagish.kloudspot_crud.model.Admin;
import com.vagish.kloudspot_crud.repository.AdminRepository;
import com.vagish.kloudspot_crud.security.JwtService;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AdminRepository adminRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private Admin admin(UUID id, String email, String password) {
        Admin admin = new Admin();
        admin.setId(id);
        admin.setName("Admin");
        admin.setEmail(email);
        admin.setPassword(password);
        return admin;
    }

    @Test
    void loginReturnsTokenAndAdminWhenCredentialsValid() {
        UUID id = UUID.randomUUID();
        Admin admin = admin(id, "admin@kloudspot.com", "hashed");
        when(adminRepository.findByEmailIgnoreCase("admin@kloudspot.com")).thenReturn(Optional.of(admin));
        when(passwordEncoder.matches("admin123", "hashed")).thenReturn(true);
        when(jwtService.generateToken(id, "admin@kloudspot.com")).thenReturn("jwt-token");

        LoginResponse response = authService.login(new LoginRequest("admin@kloudspot.com", "admin123"));

        assertThat(response.token()).isEqualTo("jwt-token");
        assertThat(response.admin().id()).isEqualTo(id);
        assertThat(response.admin().email()).isEqualTo("admin@kloudspot.com");
    }

    @Test
    void loginTrimsEmailBeforeLookup() {
        UUID id = UUID.randomUUID();
        Admin admin = admin(id, "admin@kloudspot.com", "hashed");
        when(adminRepository.findByEmailIgnoreCase("admin@kloudspot.com")).thenReturn(Optional.of(admin));
        when(passwordEncoder.matches("admin123", "hashed")).thenReturn(true);
        when(jwtService.generateToken(id, "admin@kloudspot.com")).thenReturn("jwt-token");

        authService.login(new LoginRequest("  admin@kloudspot.com  ", "admin123"));

        verify(adminRepository).findByEmailIgnoreCase("admin@kloudspot.com");
    }

    @Test
    void loginFailsWhenEmailUnknown() {
        when(adminRepository.findByEmailIgnoreCase(any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(new LoginRequest("nobody@kloudspot.com", "admin123")))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Invalid email or password");

        verify(jwtService, never()).generateToken(any(), any());
    }

    @Test
    void loginFailsWhenPasswordIncorrect() {
        Admin admin = admin(UUID.randomUUID(), "admin@kloudspot.com", "hashed");
        when(adminRepository.findByEmailIgnoreCase("admin@kloudspot.com")).thenReturn(Optional.of(admin));
        when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(new LoginRequest("admin@kloudspot.com", "wrong")))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Invalid email or password");

        verify(jwtService, never()).generateToken(any(), any());
    }
}
