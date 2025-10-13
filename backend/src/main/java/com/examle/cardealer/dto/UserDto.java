package com.example.cardealer.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Data Transfer Object (DTO) for representing a user.
 */
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Schema(description = "Data Transfer Object for user representation")
public class UserDto {

    @Schema(description = "Unique identifier of the user", example = "1")
    private Long id;

    @NotBlank(message = "Username cannot be blank")
    @Size(min = 3, max = 20, message = "Username must be between 3 and 20 characters")
    @Pattern(
            regexp = "^\\w+$",
            message = "Username can only contain letters, numbers and underscores"
    )
    @Schema(description = "Unique username", example = "john_doe")
    private String username;

    @Schema(description = "List of favorite car IDs")
    private List<@Positive(message = "Car ID must be positive") Long> favoriteCarIds;

    @Schema(description = "List of order IDs placed by the user")
    private List<@Positive(message = "Order ID must be positive") Long> orderIds;
}