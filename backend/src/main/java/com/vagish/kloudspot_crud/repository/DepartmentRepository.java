package com.vagish.kloudspot_crud.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vagish.kloudspot_crud.model.Department;

public interface DepartmentRepository extends JpaRepository<Department, UUID> {

    boolean existsByNameIgnoreCase(String name);
}
