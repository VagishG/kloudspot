package com.vagish.kloudspot_crud.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vagish.kloudspot_crud.model.Admin;

public interface AdminRepository extends JpaRepository<Admin, UUID> {

    Optional<Admin> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);
}
