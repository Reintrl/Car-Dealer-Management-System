package com.example.cardealer.controller;

import com.example.cardealer.dto.CarDto;
import com.example.cardealer.exception.ErrorResponse;
import com.example.cardealer.service.CarService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.PositiveOrZero;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cars")
@Validated
@Tag(name = "Car Operations", description = "Endpoints for managing cars")
public class CarController {

    private final CarService carService;

    public CarController(CarService carService) {
        this.carService = carService;
    }

    @Operation(summary = "Get all cars", description = "Returns list of all available cars",
            responses = {
                @ApiResponse(responseCode = "200", description = "Successfully retrieved list"),
                @ApiResponse(responseCode = "500", description = "Internal server error",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            })
    @GetMapping
    public ResponseEntity<List<CarDto>> getAllCars() {
        return ResponseEntity.ok(carService.getAllCars());
    }

    @Operation(summary = "Get car by ID", description = "Returns a single car by its ID",
            responses = {
                @ApiResponse(responseCode = "200", description = "Car found"),
                @ApiResponse(responseCode = "404", description = "Car not found",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(responseCode = "400", description = "Invalid ID supplied",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            })
    @GetMapping("/{id}")
    public ResponseEntity<CarDto> getCarById(
            @Parameter(description = "ID of the car to retrieve", required = true, example = "1")
            @PathVariable @Min(1) Long id) {
        return ResponseEntity.ok(carService.getCarById(id));
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<CarDto>> createCarsBulk(
            @RequestBody List<CarDto> carDtos) {

        List<CarDto> createdRecipes = carService.createCarsBulk(carDtos);
        return ResponseEntity.status(201).body(createdRecipes);
    }

    @Operation(summary = "Create a new car", description = "Creates and returns the new car",
            responses = {
                @ApiResponse(responseCode = "201", description = "Car created successfully"),
                @ApiResponse(responseCode = "400", description = "Invalid input data",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(responseCode = "409", description = "VIN already exists",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    @PostMapping
    public ResponseEntity<CarDto> createCar(
            @Parameter(description = "Car data to create", required = true)
            @Valid @RequestBody CarDto carDto) {
        CarDto createdCar = carService.createCar(carDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCar);
    }

    @Operation(summary = "Update an existing car", description = "Updates and returns the modified car",
            responses = {
                @ApiResponse(responseCode = "200", description = "Car updated successfully"),
                @ApiResponse(responseCode = "404", description = "Car not found",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(responseCode = "400", description = "Invalid input or ID",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(responseCode = "409", description = "VIN conflict",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            })
    @PutMapping("/{id}")
    public ResponseEntity<CarDto> updateCar(
            @Parameter(description = "ID of the car to update", required = true, example = "1")
            @PathVariable @Min(1) Long id,
            @Parameter(description = "Updated car data", required = true)
            @Valid @RequestBody CarDto carDto) {
        return ResponseEntity.ok(carService.updateCar(id, carDto));
    }

    @Operation(summary = "Delete a car", description = "Deletes a car by its ID",
            responses = {
                @ApiResponse(responseCode = "204", description = "Car deleted successfully"),
                @ApiResponse(responseCode = "404", description = "Car not found",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(responseCode = "400", description = "Invalid ID supplied",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCar(
            @Parameter(description = "ID of the car to delete", required = true, example = "1")
            @PathVariable @Min(1) Long id) {
        carService.deleteCar(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Filter cars", description = "Filters cars by year range and max mileage",
            responses = {
                @ApiResponse(responseCode = "200", description = "Filtered list of cars"),
                @ApiResponse(responseCode = "400", description = "Invalid filter parameters",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    @GetMapping("/filter")
    public ResponseEntity<List<CarDto>> filterCars(
            @Parameter(description = "Minimum manufacturing year", example = "2010")
            @RequestParam(required = false) @Min(1886) Integer minYear,

            @Parameter(description = "Maximum manufacturing year", example = "2023")
            @RequestParam(required = false) @Max(2025) Integer maxYear,

            @Parameter(description = "Maximum mileage allowed", example = "50000.0")
            @RequestParam(required = false) @PositiveOrZero Double maxMileage) {
        return ResponseEntity.ok(carService.findCarsByYearAndMileage(minYear, maxYear, maxMileage));
    }
}
