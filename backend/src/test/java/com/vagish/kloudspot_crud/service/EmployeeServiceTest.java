package com.vagish.kloudspot_crud.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import com.vagish.kloudspot_crud.dto.EmployeeRequest;
import com.vagish.kloudspot_crud.dto.EmployeeResponse;
import com.vagish.kloudspot_crud.dto.PageResponse;
import com.vagish.kloudspot_crud.exception.DuplicateResourceException;
import com.vagish.kloudspot_crud.exception.ResourceNotFoundException;
import com.vagish.kloudspot_crud.exception.ValidationException;
import com.vagish.kloudspot_crud.model.Admin;
import com.vagish.kloudspot_crud.model.Department;
import com.vagish.kloudspot_crud.model.Employee;
import com.vagish.kloudspot_crud.repository.AdminRepository;
import com.vagish.kloudspot_crud.repository.DepartmentRepository;
import com.vagish.kloudspot_crud.repository.EmployeeRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private AdminRepository adminRepository;

    @Mock
    private CurrentAdmin currentAdmin;

    @InjectMocks
    private EmployeeService employeeService;

    private final UUID departmentId = UUID.randomUUID();
    private final UUID adminId = UUID.randomUUID();

    private EmployeeRequest request(String empId, String email, String phone) {
        return new EmployeeRequest(
                empId,
                "  Aarav Sharma  ",
                email,
                phone,
                departmentId,
                "  Software Engineer  ",
                LocalDate.of(2024, 6, 1),
                new BigDecimal("650000"),
                true);
    }

    private EmployeeRequest validRequest() {
        return request("EMP-1001", "Aarav.Sharma@Kloudspot.com", "9876543210");
    }

    private Department department() {
        Department department = new Department();
        department.setId(departmentId);
        department.setName("Engineering");
        return department;
    }

    private Admin admin() {
        Admin admin = new Admin();
        admin.setId(adminId);
        admin.setName("Admin");
        admin.setEmail("admin@kloudspot.com");
        return admin;
    }

    private void stubUniquenessForCreate() {
        when(employeeRepository.existsByEmpIdIgnoreCase(any())).thenReturn(false);
        when(employeeRepository.existsByEmailIgnoreCase(any())).thenReturn(false);
    }

    @Test
    void createPersistsAndMapsEmployee() {
        stubUniquenessForCreate();
        when(departmentRepository.findById(departmentId)).thenReturn(Optional.of(department()));
        when(currentAdmin.id()).thenReturn(adminId);
        when(adminRepository.findById(adminId)).thenReturn(Optional.of(admin()));
        when(employeeRepository.save(any(Employee.class))).thenAnswer(invocation -> {
            Employee saved = invocation.getArgument(0);
            saved.setId(UUID.randomUUID());
            return saved;
        });

        EmployeeResponse response = employeeService.create(validRequest());

        assertThat(response.empId()).isEqualTo("EMP-1001");
        assertThat(response.fullName()).isEqualTo("Aarav Sharma");
        assertThat(response.email()).isEqualTo("aarav.sharma@kloudspot.com");
        assertThat(response.designation()).isEqualTo("Software Engineer");
        assertThat(response.departmentName()).isEqualTo("Engineering");
        assertThat(response.createdBy()).isEqualTo(adminId);
    }

    @Test
    void createRejectsShortPhoneNumber() {
        assertThatThrownBy(() -> employeeService.create(request("EMP-1001", "a@b.com", "12345")))
                .isInstanceOf(ValidationException.class)
                .hasMessage("Validation failed");

        verify(employeeRepository, never()).save(any());
    }

    @Test
    void createRejectsDuplicateEmployeeId() {
        when(employeeRepository.existsByEmpIdIgnoreCase("EMP-1001")).thenReturn(true);

        assertThatThrownBy(() -> employeeService.create(validRequest()))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessage("An employee with this Employee ID already exists");

        verify(employeeRepository, never()).save(any());
    }

    @Test
    void createRejectsDuplicateEmail() {
        when(employeeRepository.existsByEmpIdIgnoreCase(any())).thenReturn(false);
        when(employeeRepository.existsByEmailIgnoreCase(any())).thenReturn(true);

        assertThatThrownBy(() -> employeeService.create(validRequest()))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessage("An employee with this email already exists");

        verify(employeeRepository, never()).save(any());
    }

    @Test
    void createFailsWhenDepartmentMissing() {
        stubUniquenessForCreate();
        when(departmentRepository.findById(departmentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> employeeService.create(validRequest()))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Department not found");
    }

    @Test
    void createFailsWhenAdminMissing() {
        stubUniquenessForCreate();
        when(departmentRepository.findById(departmentId)).thenReturn(Optional.of(department()));
        when(currentAdmin.id()).thenReturn(adminId);
        when(adminRepository.findById(adminId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> employeeService.create(validRequest()))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Admin not found");
    }

    @Test
    void createTranslatesDataIntegrityViolationToDuplicate() {
        stubUniquenessForCreate();
        when(departmentRepository.findById(departmentId)).thenReturn(Optional.of(department()));
        when(currentAdmin.id()).thenReturn(adminId);
        when(adminRepository.findById(adminId)).thenReturn(Optional.of(admin()));
        when(employeeRepository.save(any(Employee.class)))
                .thenThrow(new DataIntegrityViolationException("boom"));

        assertThatThrownBy(() -> employeeService.create(validRequest()))
                .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void listClampsPageAndSize() {
        when(employeeRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        employeeService.list(0, 500, null, null, null);

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(employeeRepository).findAll(any(Specification.class), captor.capture());

        assertThat(captor.getValue().getPageNumber()).isZero();
        assertThat(captor.getValue().getPageSize()).isEqualTo(100);
        assertThat(captor.getValue().getSort().getOrderFor("fullName").getDirection())
                .isEqualTo(Sort.Direction.ASC);
    }

    @Test
    void listMapsContentAndTotals() {
        Employee first = new Employee();
        first.setId(UUID.randomUUID());
        first.setEmpId("EMP-1001");
        first.setFullName("Aarav Sharma");
        first.setEmail("aarav@kloudspot.com");
        first.setPhoneNumber("9876543210");
        first.setDepartment(department());
        first.setDesignation("Engineer");
        first.setDateOfJoining(LocalDate.of(2024, 6, 1));
        first.setSalary(new BigDecimal("650000"));
        first.setStatus(true);
        first.setCreatedBy(admin());

        when(employeeRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(first)));

        PageResponse<EmployeeResponse> result = employeeService.list(1, 10, "aarav", departmentId, Boolean.TRUE);

        assertThat(result.total()).isEqualTo(1);
        assertThat(result.page()).isEqualTo(1);
        assertThat(result.size()).isEqualTo(10);
        assertThat(result.data()).hasSize(1);
        assertThat(result.data().get(0).fullName()).isEqualTo("Aarav Sharma");
    }

    @Test
    void getByIdReturnsResponse() {
        Employee employee = new Employee();
        employee.setId(UUID.randomUUID());
        employee.setEmpId("EMP-1");
        employee.setFullName("Aarav");
        employee.setEmail("a@b.com");
        employee.setPhoneNumber("9876543210");
        employee.setDepartment(department());
        employee.setDesignation("Engineer");
        employee.setDateOfJoining(LocalDate.now());
        employee.setSalary(BigDecimal.TEN);
        employee.setCreatedBy(admin());

        when(employeeRepository.findById(employee.getId())).thenReturn(Optional.of(employee));

        EmployeeResponse response = employeeService.getById(employee.getId());

        assertThat(response.id()).isEqualTo(employee.getId());
        assertThat(response.email()).isEqualTo("a@b.com");
    }

    @Test
    void getByIdMissingThrows() {
        UUID id = UUID.randomUUID();
        when(employeeRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> employeeService.getById(id))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Employee not found");
    }

    @Test
    void updateMissingThrows() {
        UUID id = UUID.randomUUID();
        when(employeeRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> employeeService.update(id, validRequest()))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Employee not found");
    }

    @Test
    void updateAppliesChangesAndRecordsUpdater() {
        UUID id = UUID.randomUUID();
        Employee existing = new Employee();
        existing.setId(id);
        existing.setCreatedBy(admin());

        when(employeeRepository.findById(id)).thenReturn(Optional.of(existing));
        when(employeeRepository.existsByEmpIdIgnoreCaseAndIdNot("EMP-1001", id)).thenReturn(false);
        when(employeeRepository.existsByEmailIgnoreCaseAndIdNot("Aarav.Sharma@Kloudspot.com", id)).thenReturn(false);
        when(departmentRepository.findById(departmentId)).thenReturn(Optional.of(department()));
        when(currentAdmin.id()).thenReturn(adminId);
        when(adminRepository.findById(adminId)).thenReturn(Optional.of(admin()));
        when(employeeRepository.save(any(Employee.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EmployeeResponse response = employeeService.update(id, validRequest());

        assertThat(response.email()).isEqualTo("aarav.sharma@kloudspot.com");
        assertThat(response.updatedBy()).isEqualTo(adminId);
        assertThat(response.designation()).isEqualTo("Software Engineer");
    }

    @Test
    void deleteMissingThrows() {
        UUID id = UUID.randomUUID();
        when(employeeRepository.existsById(id)).thenReturn(false);

        assertThatThrownBy(() -> employeeService.delete(id))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Employee not found");

        verify(employeeRepository, never()).deleteById(any());
    }

    @Test
    void deleteRemovesExistingEmployee() {
        UUID id = UUID.randomUUID();
        when(employeeRepository.existsById(id)).thenReturn(true);

        employeeService.delete(id);

        verify(employeeRepository).deleteById(id);
    }

    @Test
    void searchAllMapsResults() {
        Employee employee = new Employee();
        employee.setId(UUID.randomUUID());
        employee.setEmpId("EMP-1");
        employee.setFullName("Aarav");
        employee.setEmail("a@b.com");
        employee.setPhoneNumber("9876543210");
        employee.setDepartment(department());
        employee.setDesignation("Engineer");
        employee.setDateOfJoining(LocalDate.now());
        employee.setSalary(BigDecimal.TEN);
        employee.setCreatedBy(admin());

        when(employeeRepository.findAll(any(Specification.class), any(Sort.class)))
                .thenReturn(List.of(employee));

        List<EmployeeResponse> result = employeeService.searchAll("aarav", null, null);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).fullName()).isEqualTo("Aarav");

        verify(employeeRepository).findAll(any(Specification.class), any(Sort.class));
    }

    @Test
    void getByIdUsesNullSafeMapping() {
        Employee employee = new Employee();
        employee.setId(UUID.randomUUID());
        employee.setDepartment(department());

        when(employeeRepository.findById(employee.getId())).thenReturn(Optional.of(employee));

        EmployeeResponse response = employeeService.getById(employee.getId());

        assertThat(response.createdBy()).isNull();
        assertThat(response.updatedBy()).isNull();
    }
}
