package com.example.cardealer.controller;

import com.example.cardealer.dto.CarDto;
import com.example.cardealer.dto.DealerDto;
import com.example.cardealer.exception.ErrorResponse;
import com.example.cardealer.service.DealerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
@RequestMapping("/api/dealers")
@Validated
@Tag(name = "Dealer Management", description = "API endpoints for managing car dealerships")
public class DealerController {

    private final DealerService dealerService;

    public DealerController(DealerService dealerService) {
        this.dealerService = dealerService;
    }

    @Operation(summary = "Get all dealers",
            description = "Retrieves a list of all registered car dealerships",
            responses = {
                @ApiResponse(responseCode = "200", description = "Successfully retrieved dealer list"),
                @ApiResponse(responseCode = "500", description = "Internal server error",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            })
    @GetMapping
    public ResponseEntity<List<DealerDto>> getAllDealers() {
        return ResponseEntity.ok(dealerService.getAllDealers());
    }

    @Operation(summary = "Get dealer by ID",
            description = "Retrieves a specific dealer by their unique identifier",
            responses = {
                @ApiResponse(responseCode = "200", description = "Dealer found and returned"),
                @ApiResponse(responseCode = "400", description = "Invalid dealer ID format",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(responseCode = "404", description = "Dealer not found",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            })
    @GetMapping("/{id}")
    public ResponseEntity<DealerDto> getDealerById(
            @Parameter(description = "Unique identifier of the dealer", required = true, example = "1")
            @PathVariable @Min(1) Long id) {
        return ResponseEntity.ok(dealerService.getDealerById(id));
    }

    @Operation(summary = "Create new dealer",
            description = "Registers a new car dealership in the system",
            responses = {
                @ApiResponse(responseCode = "201", description = "Dealer created successfully"),
                @ApiResponse(responseCode = "400", description = "Invalid dealer data",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(responseCode = "409", description = "Dealer with this name/phone/address already exists",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            })
    @PostMapping
    public ResponseEntity<DealerDto> createDealer(
            @Parameter(description = "Dealer data to be created", required = true)
            @Valid @RequestBody DealerDto dealerDto) {
        DealerDto createdDealer = dealerService.createDealer(dealerDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdDealer);
    }

    @Operation(summary = "Update dealer",
            description = "Updates information for an existing car dealership",
            responses = {
                @ApiResponse(responseCode = "200", description = "Dealer updated successfully"),
                @ApiResponse(responseCode = "400", description = "Invalid input data",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(responseCode = "404", description = "Dealer not found",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(responseCode = "409", description = "Unique constraint violation",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            })
    @PutMapping("/{id}")
    public ResponseEntity<DealerDto> updateDealer(
            @Parameter(description = "Unique identifier of the dealer to update", required = true, example = "1")
            @PathVariable @Min(1) Long id,
            @Parameter(description = "Updated dealer data", required = true)
            @Valid @RequestBody DealerDto dealerDto) {
        return ResponseEntity.ok(dealerService.updateDealer(id, dealerDto));
    }

    @Operation(summary = "Delete dealer",
            description = "Removes a car dealership from the system",
            responses = {
                @ApiResponse(responseCode = "204", description = "Dealer deleted successfully"),
                @ApiResponse(responseCode = "400", description = "Invalid dealer ID format",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(responseCode = "404", description = "Dealer not found",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDealer(
            @Parameter(description = "Unique identifier of the dealer to delete", required = true, example = "1")
            @PathVariable @Min(1) Long id) {
        dealerService.deleteDealer(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get dealer's cars",
            description = "Retrieves all cars belonging to a specific dealer",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Successfully retrieved dealer's cars"),
                    @ApiResponse(responseCode = "400", description = "Invalid dealer ID format",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                    @ApiResponse(responseCode = "404", description = "Dealer not found",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            })
    @GetMapping("/{dealerId}/cars")
    public ResponseEntity<List<CarDto>> getDealerCars(
            @Parameter(description = "ID of the dealer to retrieve cars for", required = true, example = "1")
            @PathVariable @Min(1) Long dealerId) {
        return ResponseEntity.ok(dealerService.getDealerCars(dealerId));
    }

    @Operation(summary = "Find dealers by brand",
            description = "Searches for dealers that sell vehicles of the specified brand",
            responses = {
                @ApiResponse(responseCode = "200", description = "List of matching dealers returned"),
                @ApiResponse(responseCode = "400", description = "Invalid brand parameter",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            })
    @GetMapping("/by-brand")
    public ResponseEntity<List<DealerDto>> getDealersByBrand(
            @Parameter(description = "Vehicle brand to search for (2-50 characters)",
                    required = true,
                    example = "Toyota")
            @RequestParam @NotBlank @Size(min = 2, max = 50) String brand) {
        return ResponseEntity.ok(dealerService.getDealersByBrand(brand));
    }

    @Operation(summary = "Find dealers by brand (native query)",
            description = "Searches for dealers using optimized native SQL query",
            responses = {
                @ApiResponse(responseCode = "200", description = "List of matching dealers returned"),
                @ApiResponse(responseCode = "400", description = "Invalid brand parameter",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            })
    @GetMapping("/by-brand-native")
    public ResponseEntity<List<DealerDto>> getDealersByBrandNative(
            @Parameter(description = "Vehicle brand to search for (2-50 characters)",
                    required = true,
                    example = "Toyota")
            @RequestParam @NotBlank @Size(min = 2, max = 50) String brand) {
        return ResponseEntity.ok(dealerService.getDealersByBrandNative(brand));
    }
}