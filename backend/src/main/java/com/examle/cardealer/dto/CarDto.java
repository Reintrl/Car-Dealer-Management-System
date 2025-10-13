package com.example.cardealer.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Data Transfer Object (DTO) for representing a car.
 */
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Schema(description = "Data Transfer Object for car representation")
public class CarDto {
    @Schema(description = "Unique identifier of the car", example = "1")
    private Long id;

    @NotBlank(message = "VIN cannot be empty")
    @Size(min = 17, max = 17, message = "VIN must be exactly 17 characters")
    @Pattern(
            regexp = "^[A-HJ-NPR-Z\\d]{17}$",
            message = "Invalid VIN format. Must be alphanumeric (excluding I, O, Q)"
    )
    @Schema(description = "Vehicle Identification Number", example = "1HGCM82633A123456")
    private String vin;

    @NotBlank(message = "Model cannot be empty")
    @Size(min = 1, max = 50, message = "Model must be between 1 and 50 characters")
    @Pattern(
            regexp = "^[a-zA-Z0-9\\s\\-]+$",
            message = "Model can only contain letters, numbers, spaces, and hyphens"
    )
    @Schema(description = "Car model", example = "Camry")
    private String model;

    @NotBlank(message = "Brand cannot be empty")
    @Size(min = 2, max = 50, message = "Brand must be between 2 and 50 characters")
    @Pattern(
            regexp = "^[a-zA-Z\\s\\-]+$",
            message = "Brand can only contain letters, spaces, and hyphens"
    )
    @Schema(description = "Car brand", example = "Toyota")
    private String brand;

    @Min(value = 1886, message = "Year must be after 1886 (first car invented)")
    @Max(
            value = 2025,
            message = "Year cannot be in the future (current max: 2025)"
    )
    @Schema(description = "Manufacturing year", example = "2022")
    private Integer year;

    @PositiveOrZero(message = "Price cannot be negative")
    @Digits(
            integer = 7,
            fraction = 2,
            message = "Price must have up to 7 integer and 2 decimal digits"
    )
    @Schema(description = "Car price in USD", example = "25000.00")
    private double price;

    @NotBlank(message = "Color cannot be empty")
    @Size(min = 2, max = 30, message = "Color must be between 2 and 30 characters")
    @Pattern(
            regexp = "^[a-zA-Z\\s\\-]+$",
            message = "Color can only contain letters, spaces, and hyphens"
    )
    @Schema(description = "Car color", example = "Metallic Red")
    private String color;

    @PositiveOrZero(message = "Mileage cannot be negative")
    @Digits(
            integer = 6,
            fraction = 1,
            message = "Mileage must have up to 6 integer and 1 decimal digit"
    )
    @Schema(description = "Car mileage in miles/km", example = "15000.5")
    private double mileage;

    @NotNull(message = "Dealer ID cannot be null")
    @Positive(message = "Dealer ID must be a positive number")
    @Schema(description = "ID of the dealer associated with this car", example = "5")
    private Long dealerId;

    @Schema(description = "List of user IDs who favorited this car")
    private List<Long> userIdsWhoFavorited;

    @Schema(description = "ID of the order associated with this car (nullable)", example = "10")
    private Long orderId;
}
