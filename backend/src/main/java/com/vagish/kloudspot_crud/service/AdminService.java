package com.vagish.kloudspot_crud.service;

import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vagish.kloudspot_crud.dto.AdminCreateRequest;
import com.vagish.kloudspot_crud.dto.AdminResponse;
import com.vagish.kloudspot_crud.exception.DuplicateResourceException;
import com.vagish.kloudspot_crud.model.Admin;
import com.vagish.kloudspot_crud.repository.AdminRepository;

@Service
public class AdminService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<AdminResponse> listAll() {
        return adminRepository.findAll().stream().map(AdminResponse::from).toList();
    }

    @Transactional
    public AdminResponse create(AdminCreateRequest request) {
        String email = request.email().trim();

        if (adminRepository.existsByEmailIgnoreCase(email)) {
            throw new DuplicateResourceException("An admin with this email already exists");
        }

        Admin admin = new Admin();
        admin.setName(request.name().trim());
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode(request.password()));

        try {
            admin = adminRepository.save(admin);
        } catch (DataIntegrityViolationException ex) {
            throw new DuplicateResourceException("An admin with this email already exists");
        }

        return AdminResponse.from(admin);
    }
}
