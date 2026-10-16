package com.vagish.kloudspot_crud.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.vagish.kloudspot_crud.model.Employee;

public interface EmployeeRepository extends JpaRepository<Employee, UUID>, JpaSpecificationExecutor<Employee> {

    boolean existsByEmpIdIgnoreCase(String empId);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmpIdIgnoreCaseAndIdNot(String empId, UUID id);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, UUID id);

    @Override
    @EntityGraph(attributePaths = { "department", "createdBy", "updatedBy" })
    Optional<Employee> findById(UUID id);

    @Override
    @EntityGraph(attributePaths = { "department", "createdBy", "updatedBy" })
    Page<Employee> findAll(Specification<Employee> specification, Pageable pageable);
}
