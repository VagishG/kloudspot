package com.vagish.kloudspot_crud.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.vagish.kloudspot_crud.model.Admin;
import com.vagish.kloudspot_crud.repository.AdminRepository;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (adminRepository.count() > 0) {
            return;
        }

        Admin admin = new Admin();
        admin.setName("Admin");
        admin.setEmail("admin@kloudspot.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        adminRepository.save(admin);

        log.info("Seeded bootstrap admin: admin@kloudspot.com / admin123");
    }
}
