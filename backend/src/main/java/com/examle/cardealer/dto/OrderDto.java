package com.example.cardealer.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.util.Date;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Data Transfer Object (DTO) for representing an order.
 */
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Schema(description = "Data Transfer Object for order representation")
public class OrderDto {

    @Schema(description = "Unique identifier of the order", example = "1")
    private Long id;

    @NotNull(message = "Order date cannot be null")
    @PastOrPresent(message = "Order date cannot be in the future")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    @Schema(description = "Date and time when order was placed",
            example = "2023-05-15 14:30:00",
            type = "string",
            format = "date-time")
    private Date orderDate;

    @Positive(message = "Total price must be positive")
    @Digits(integer = 10, fraction = 2, message = "Total price must have up to 10 integer and 2 decimal digits")
    @Schema(description = "Total price of the order", example = "45000.50")
    private double totalPrice;

    @NotNull(message = "User ID cannot be null")
    @Positive(message = "User ID must be positive")
    @Schema(description = "ID of the user who placed the order", example = "5")
    private Long userId;

    @NotEmpty(message = "Car IDs list cannot be empty")
    @Size(min = 1, max = 10, message = "Order must contain between 1 and 10 cars")
    @Schema(description = "List of car IDs included in the order")
    private List<@Positive(message = "Car ID must be positive") Long> carIds;
}