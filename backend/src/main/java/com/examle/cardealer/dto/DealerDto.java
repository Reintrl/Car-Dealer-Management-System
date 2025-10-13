package com.example.cardealer.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Data Transfer Object (DTO) for representing a dealer.
 */
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Data Transfer Object for dealer representation")
public class DealerDto {

    @Schema(description = "Unique identifier of the dealer", example = "1")
    private Long id;

    @NotBlank(message = "Dealer name cannot be empty")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Pattern(
            regexp = "^[a-zA-Z0-9\\s\\-.,&]+$",
            message = "Name can only contain letters, numbers, spaces, hyphens, commas, dots, and ampersands"
    )
    @Schema(description = "Full name of the dealership", example = "Best Auto Group LLC")
    private String name;

    @NotBlank(message = "Address cannot be empty")
    @Size(min = 5, max = 200, message = "Address must be between 5 and 200 characters")
    @Schema(description = "Physical address of the dealership", example = "123 Auto Mall Rd, Detroit, MI 48201")
    private String address;

    @NotBlank(message = "Phone number cannot be empty")
    @Pattern(
            regexp = "^\\+?[0-9\\s\\-()]{7,20}$",
            message = "Invalid phone number format. Use digits, spaces, hyphens, or parentheses"
    )
    @Schema(description = "Contact phone number", example = "+1 (800) 555-0199")
    private String phoneNumber;

    @Schema(description = "List of cars available at this dealership")
    private List<CarDto> cars;
}