package com.vagish.kloudspot_crud.service;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

import jakarta.persistence.criteria.Predicate;

@Service
public class EmployeeService {

    private static final int MAX_PAGE_SIZE = 100;

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final AdminRepository adminRepository;
    private final CurrentAdmin currentAdmin;

    public EmployeeService(EmployeeRepository employeeRepository, DepartmentRepository departmentRepository,
            AdminRepository adminRepository, CurrentAdmin currentAdmin) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.adminRepository = adminRepository;
        this.currentAdmin = currentAdmin;
    }

    @Transactional(readOnly = true)
    public PageResponse<EmployeeResponse> list(int page, int size, String search, UUID departmentId,
            Boolean status) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);

        Specification<Employee> spec = buildSpec(search, departmentId, status);
        Pageable pageable = PageRequest.of(safePage - 1, safeSize, Sort.by(Sort.Direction.ASC, "fullName"));

        Page<Employee> result = employeeRepository.findAll(spec, pageable);

        List<EmployeeResponse> data = result.getContent().stream().map(EmployeeResponse::from).toList();
        return new PageResponse<>(data, result.getTotalElements(), safePage, safeSize);
    }

    @Transactional(readOnly = true)
    public List<EmployeeResponse> searchAll(String search, UUID departmentId, Boolean status) {
        Specification<Employee> spec = buildSpec(search, departmentId, status);
        Sort sort = Sort.by(Sort.Direction.ASC, "fullName");
        return employeeRepository.findAll(spec, sort).stream().map(EmployeeResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getById(UUID id) {
        return employeeRepository.findById(id)
                .map(EmployeeResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
    }

    @Transactional
    public EmployeeResponse create(EmployeeRequest request) {
        validate(request);
        validateUniqueness(request, null);

        Department department = resolveDepartment(request.departmentId());
        Admin creator = resolveAdmin(currentAdmin.id());

        Employee employee = new Employee();
        employee.setEmpId(request.empId().trim());
        employee.setFullName(request.fullName().trim());
        employee.setEmail(request.email().trim().toLowerCase(Locale.ROOT));
        employee.setPhoneNumber(request.phoneNumber().trim());
        employee.setDepartment(department);
        employee.setDesignation(request.designation().trim());
        employee.setDateOfJoining(request.dateOfJoining());
        employee.setSalary(request.salary());
        employee.setStatus(request.status());
        employee.setCreatedBy(creator);

        try {
            employee = employeeRepository.save(employee);
        } catch (DataIntegrityViolationException ex) {
            throw new DuplicateResourceException("An employee with this Employee ID or email already exists");
        }

        return EmployeeResponse.from(employee);
    }

    @Transactional
    public EmployeeResponse update(UUID id, EmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        validate(request);
        validateUniqueness(request, id);

        Department department = resolveDepartment(request.departmentId());
        Admin updater = resolveAdmin(currentAdmin.id());

        employee.setEmpId(request.empId().trim());
        employee.setFullName(request.fullName().trim());
        employee.setEmail(request.email().trim().toLowerCase(Locale.ROOT));
        employee.setPhoneNumber(request.phoneNumber().trim());
        employee.setDepartment(department);
        employee.setDesignation(request.designation().trim());
        employee.setDateOfJoining(request.dateOfJoining());
        employee.setSalary(request.salary());
        employee.setStatus(request.status());
        employee.setUpdatedBy(updater);

        try {
            employee = employeeRepository.save(employee);
        } catch (DataIntegrityViolationException ex) {
            throw new DuplicateResourceException("An employee with this Employee ID or email already exists");
        }

        return EmployeeResponse.from(employee);
    }

    @Transactional
    public void delete(UUID id) {
        if (!employeeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Employee not found");
        }
        employeeRepository.deleteById(id);
    }

    private void validate(EmployeeRequest request) {
        if (request.phoneNumber().replaceAll("\\D", "").length() < 10) {
            throw new ValidationException("Validation failed",
                    java.util.Map.of("phoneNumber", "Enter a valid phone number"));
        }
    }

    private void validateUniqueness(EmployeeRequest request, UUID excludingId) {
        String empId = request.empId().trim();
        String email = request.email().trim();

        boolean empIdTaken = excludingId == null
                ? employeeRepository.existsByEmpIdIgnoreCase(empId)
                : employeeRepository.existsByEmpIdIgnoreCaseAndIdNot(empId, excludingId);
        if (empIdTaken) {
            throw new DuplicateResourceException("An employee with this Employee ID already exists");
        }

        boolean emailTaken = excludingId == null
                ? employeeRepository.existsByEmailIgnoreCase(email)
                : employeeRepository.existsByEmailIgnoreCaseAndIdNot(email, excludingId);
        if (emailTaken) {
            throw new DuplicateResourceException("An employee with this email already exists");
        }
    }

    private Department resolveDepartment(UUID departmentId) {
        return departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
    }

    private Admin resolveAdmin(UUID adminId) {
        return adminRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
    }

    private Specification<Employee> buildSpec(String search, UUID departmentId, Boolean status) {
        return (root, query, cb) -> {
            java.util.List<Predicate> predicates = new java.util.ArrayList<>();

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("fullName")), pattern),
                        cb.like(cb.lower(root.get("email")), pattern),
                        cb.like(cb.lower(root.get("empId")), pattern)));
            }

            if (departmentId != null) {
                predicates.add(cb.equal(root.get("department").get("id"), departmentId));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
