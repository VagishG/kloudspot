package com.vagish.kloudspot_crud.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import com.vagish.kloudspot_crud.dto.DepartmentCreateRequest;
import com.vagish.kloudspot_crud.dto.DepartmentResponse;
import com.vagish.kloudspot_crud.exception.DuplicateResourceException;
import com.vagish.kloudspot_crud.exception.ResourceNotFoundException;
import com.vagish.kloudspot_crud.model.Admin;
import com.vagish.kloudspot_crud.model.Department;
import com.vagish.kloudspot_crud.repository.AdminRepository;
import com.vagish.kloudspot_crud.repository.DepartmentRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DepartmentServiceTest {

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private AdminRepository adminRepository;

    @Mock
    private CurrentAdmin currentAdmin;

    @InjectMocks
    private DepartmentService departmentService;

    private Department department(String name) {
        Department department = new Department();
        department.setId(UUID.randomUUID());
        department.setName(name);
        return department;
    }

    @Test
    void listAllSortsByNameCaseInsensitively() {
        when(departmentRepository.findAll()).thenReturn(List.of(
                department("Marketing"), department("engineering"), department("Finance")));

        List<DepartmentResponse> result = departmentService.listAll();

        assertThat(result).extracting(DepartmentResponse::name)
                .containsExactly("engineering", "Finance", "Marketing");
    }

    @Test
    void createLinksCurrentAdminAsCreator() {
        UUID adminId = UUID.randomUUID();
        Admin creator = new Admin();
        creator.setId(adminId);

        when(departmentRepository.existsByNameIgnoreCase("Engineering")).thenReturn(false);
        when(currentAdmin.id()).thenReturn(adminId);
        when(adminRepository.findById(adminId)).thenReturn(Optional.of(creator));
        when(departmentRepository.save(any(Department.class))).thenAnswer(invocation -> {
            Department saved = invocation.getArgument(0);
            saved.setId(UUID.randomUUID());
            return saved;
        });

        DepartmentResponse response = departmentService.create(new DepartmentCreateRequest("  Engineering  "));

        assertThat(response.name()).isEqualTo("Engineering");
        verify(departmentRepository).save(any(Department.class));
    }

    @Test
    void createRejectsDuplicateName() {
        when(departmentRepository.existsByNameIgnoreCase("Engineering")).thenReturn(true);

        assertThatThrownBy(() -> departmentService.create(new DepartmentCreateRequest("Engineering")))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessage("A department with this name already exists");

        verify(departmentRepository, never()).save(any(Department.class));
    }

    @Test
    void createFailsWhenCurrentAdminMissing() {
        UUID adminId = UUID.randomUUID();
        when(departmentRepository.existsByNameIgnoreCase("Engineering")).thenReturn(false);
        when(currentAdmin.id()).thenReturn(adminId);
        when(adminRepository.findById(adminId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> departmentService.create(new DepartmentCreateRequest("Engineering")))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Admin not found");
    }

    @Test
    void createTranslatesDataIntegrityViolationToDuplicate() {
        UUID adminId = UUID.randomUUID();
        Admin creator = new Admin();
        creator.setId(adminId);

        when(departmentRepository.existsByNameIgnoreCase("Engineering")).thenReturn(false);
        when(currentAdmin.id()).thenReturn(adminId);
        when(adminRepository.findById(adminId)).thenReturn(Optional.of(creator));
        when(departmentRepository.save(any(Department.class)))
                .thenThrow(new DataIntegrityViolationException("boom"));

        assertThatThrownBy(() -> departmentService.create(new DepartmentCreateRequest("Engineering")))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessage("A department with this name already exists");
    }
}
