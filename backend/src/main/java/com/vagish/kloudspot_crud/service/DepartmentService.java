package com.vagish.kloudspot_crud.service;

import java.util.List;
import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vagish.kloudspot_crud.dto.DepartmentCreateRequest;
import com.vagish.kloudspot_crud.dto.DepartmentResponse;
import com.vagish.kloudspot_crud.exception.DuplicateResourceException;
import com.vagish.kloudspot_crud.exception.ResourceNotFoundException;
import com.vagish.kloudspot_crud.model.Admin;
import com.vagish.kloudspot_crud.model.Department;
import com.vagish.kloudspot_crud.repository.AdminRepository;
import com.vagish.kloudspot_crud.repository.DepartmentRepository;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final AdminRepository adminRepository;
    private final CurrentAdmin currentAdmin;

    public DepartmentService(DepartmentRepository departmentRepository, AdminRepository adminRepository,
            CurrentAdmin currentAdmin) {
        this.departmentRepository = departmentRepository;
        this.adminRepository = adminRepository;
        this.currentAdmin = currentAdmin;
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponse> listAll() {
        return departmentRepository.findAll().stream()
                .sorted((a, b) -> a.getName().compareToIgnoreCase(b.getName()))
                .map(DepartmentResponse::from)
                .toList();
    }

    @Transactional
    public DepartmentResponse create(DepartmentCreateRequest request) {
        String name = request.name().trim();

        if (departmentRepository.existsByNameIgnoreCase(name)) {
            throw new DuplicateResourceException("A department with this name already exists");
        }

        Admin creator = adminRepository.findById(currentAdmin.id())
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        Department department = new Department();
        department.setName(name);
        department.setCreatedBy(creator);

        try {
            department = departmentRepository.save(department);
        } catch (DataIntegrityViolationException ex) {
            throw new DuplicateResourceException("A department with this name already exists");
        }

        return DepartmentResponse.from(department);
    }

    @Transactional(readOnly = true)
    public Department getById(UUID id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
    }
}
