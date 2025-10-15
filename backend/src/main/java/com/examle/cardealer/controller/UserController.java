package com.example.cardealer.controller;

import com.example.cardealer.dto.UserDto;
import com.example.cardealer.exception.ErrorResponse;
import com.example.cardealer.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
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
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/users")
@Validated
@Tag(name = "User Management", description = "API endpoints for managing users and their favorite cars")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @Operation(summary = "Get all users",
            description = "Retrieves a list of all registered users in the system",
            responses = {
                @ApiResponse(responseCode = "200", description = "Successfully retrieved user list"),
                @ApiResponse(responseCode = "500", description = "Internal server error",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            })
    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @Operation(summary = "Get user by ID",
            description = "Retrieves a specific user by their unique identifier",
            responses = {
                @ApiResponse(responseCode = "200", description = "User found and returned"),
                @ApiResponse(responseCode = "400", description = "Invalid user ID format",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(responseCode = "404", description = "User not found",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            })
    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(
            @Parameter(description = "Unique identifier of the user", required = true, example = "1")
            @PathVariable @Min(1) Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @Operation(summary = "Create new user",
            description = "Registers a new user in the system",
            responses = {
                @ApiResponse(responseCode = "201", description = "User created successfully"),
                @ApiResponse(responseCode = "400", description = "Invalid user data",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(responseCode = "409", description = "Username or email already exists",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            })
    @PostMapping
    public ResponseEntity<UserDto> createUser(
            @Parameter(description = "User registration data", required = true)
            @Valid @RequestBody UserDto userDto) {
        UserDto createdUser = userService.createUser(userDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @Operation(summary = "Update user",
            description = "Updates information for an existing user",
            responses = {
                @ApiResponse(responseCode = "200", description = "User updated successfully"),
                @ApiResponse(responseCode = "400", description = "Invalid input data",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(responseCode = "404", description = "User not found",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(responseCode = "409", description = "Username or email conflict",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            })
    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateUser(
            @Parameter(description = "Unique identifier of the user to update", required = true, example = "1")
            @PathVariable @Min(1) Long id,
            @Parameter(description = "Updated user data", required = true)
            @Valid @RequestBody UserDto userDto) {
        return ResponseEntity.ok(userService.updateUser(id, userDto));
    }

    @Operation(summary = "Delete user",
            description = "Removes a user from the system",
            responses = {
                @ApiResponse(responseCode = "204", description = "User deleted successfully"),
                @ApiResponse(responseCode = "400", description = "Invalid user ID format",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(responseCode = "404", description = "User not found",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(
            @Parameter(description = "Unique identifier of the user to delete", required = true, example = "1")
            @PathVariable @Min(1) Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Add car to favorites",
            description = "Adds a vehicle to the user's favorite list",
            responses = {
                @ApiResponse(responseCode = "201", description = "Car added to favorites successfully"),
                @ApiResponse(responseCode = "400", description = "Invalid user or car ID",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(responseCode = "404", description = "User or car not found",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(responseCode = "409", description = "Car already in favorites",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            })
    @PostMapping("/{userId}/favorite-cars/{carId}")
    public ResponseEntity<Void> addFavoriteCar(
            @Parameter(description = "Unique identifier of the user", required = true, example = "1")
            @PathVariable @Min(1) Long userId,
            @Parameter(description = "Unique identifier of the car to add", required = true, example = "1")
            @PathVariable @Min(1) Long carId) {
        userService.addFavoriteCar(userId, carId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @Operation(summary = "Remove car from favorites",
            description = "Removes a vehicle from the user's favorite list",
            responses = {
                @ApiResponse(responseCode = "204", description = "Car removed from favorites successfully"),
                @ApiResponse(responseCode = "400", description = "Invalid user or car ID",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(responseCode = "404", description = "User, car not found or car not in favorites",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            })
    @DeleteMapping("/{userId}/favorite-cars/{carId}")
    public ResponseEntity<Void> removeFavoriteCar(
            @Parameter(description = "Unique identifier of the user", required = true, example = "1")
            @PathVariable @Min(1) Long userId,
            @Parameter(description = "Unique identifier of the car to remove", required = true, example = "1")
            @PathVariable @Min(1) Long carId) {
        userService.removeFavoriteCar(userId, carId);
        return ResponseEntity.noContent().build();
    }
}