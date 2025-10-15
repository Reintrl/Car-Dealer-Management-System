package com.example.cardealer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the CarDealer application.
 * This class is responsible for launching the Spring Boot application.
 */
@SpringBootApplication
public class CarDealerApplication {

    /**
     * The main method that starts the application.
     * Initializes the Spring context and runs the application.
     *
     * @param args command-line arguments passed during application startup.
     */
    public static void main(String[] args) {
        SpringApplication.run(CarDealerApplication.class, args);
    }
}
