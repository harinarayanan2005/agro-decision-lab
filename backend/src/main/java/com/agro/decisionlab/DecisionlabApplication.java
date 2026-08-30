package com.agro.decisionlab;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/*
 * Agro DecisionLab AI System
 * ML-Driven Crop Intelligence Server
 *
 * Database auto-config disabled because system uses CSV + ML models
 */

@SpringBootApplication
public class DecisionlabApplication {

    public static void main(String[] args) {

        SpringApplication app = new SpringApplication(DecisionlabApplication.class);

        // Disable DB auto configuration programmatically (Spring Boot 4 safe way)
        app.setDefaultProperties(java.util.Map.of(
                "spring.autoconfigure.exclude",
                String.join(",",
                        "org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration",
                        "org.springframework.boot.orm.jpa.autoconfigure.HibernateJpaAutoConfiguration"
                )
        ));

        app.run(args);

        System.out.println("\n=======================================");
        System.out.println(" Agro DecisionLab AI Server Started");
        System.out.println(" ML Crop Intelligence ACTIVE");
        System.out.println(" http://localhost:8080");
        System.out.println("=======================================\n");
    }
}