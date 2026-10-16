package com.vagish.kloudspot_crud;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration;

@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class KloudspotCrudApplication {

	public static void main(String[] args) {
		SpringApplication.run(KloudspotCrudApplication.class, args);
	}

}
