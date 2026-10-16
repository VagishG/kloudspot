package com.vagish.kloudspot_crud.service;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.vagish.kloudspot_crud.dto.AdminCreateRequest;
import com.vagish.kloudspot_crud.dto.AdminResponse;
import com.vagish.kloudspot_crud.exception.DuplicateResourceException;
import com.vagish.kloudspot_crud.model.Admin;
import com.vagish.kloudspot_crud.repository.AdminRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private AdminRepository adminRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminService adminService;

    private Admin admin(UUID id, String name, String email) {
        Admin admin = new Admin();
        admin.setId(id);
        admin.setName(name);
        admin.setEmail(email);
        admin.setPassword("hashed");
        return admin;
    }

    @Test
    void listAllMapsAdminsWithoutPasswords() {
        when(adminRepository.findAll()).thenReturn(List.of(
                admin(UUID.randomUUID(), "Admin", "admin@kloudspot.com"),
                admin(UUID.randomUUID(), "Priya", "priya@kloudspot.com")));

        List<AdminResponse> result = adminService.listAll();

        assertThat(result).hasSize(2);
        assertThat(result).extracting(AdminResponse::email)
                .containsExactly("admin@kloudspot.com", "priya@kloudspot.com");
    }

    @Test
    void createEncodesPasswordAndTrimsName() {
        when(adminRepository.existsByEmailIgnoreCase("priya@kloudspot.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded");
        when(adminRepository.save(any(Admin.class))).thenAnswer(invocation -> {
            Admin saved = invocation.getArgument(0);
            saved.setId(UUID.randomUUID());
            return saved;
        });

        AdminResponse response = adminService.create(
                new AdminCreateRequest("  Priya Nair  ", "priya@kloudspot.com", "password123"));

        assertThat(response.name()).isEqualTo("Priya Nair");
        assertThat(response.email()).isEqualTo("priya@kloudspot.com");

        verify(passwordEncoder).encode("password123");
        verify(adminRepository).save(any(Admin.class));
    }

    @Test
    void createRejectsDuplicateEmail() {
        when(adminRepository.existsByEmailIgnoreCase("admin@kloudspot.com")).thenReturn(true);

        assertThatThrownBy(() -> adminService.create(
                new AdminCreateRequest("Dup", "admin@kloudspot.com", "password123")))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessage("An admin with this email already exists");

        verify(adminRepository, never()).save(any(Admin.class));
    }

    @Test
    void createTranslatesDataIntegrityViolationToDuplicate() {
        when(adminRepository.existsByEmailIgnoreCase("priya@kloudspot.com")).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("encoded");
        when(adminRepository.save(any(Admin.class))).thenThrow(new DataIntegrityViolationException("boom"));

        assertThatThrownBy(() -> adminService.create(
                new AdminCreateRequest("Priya", "priya@kloudspot.com", "password123")))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessage("An admin with this email already exists");
    }
}
