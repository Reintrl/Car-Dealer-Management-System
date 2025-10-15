package com.example.cardealer.controller;

import com.example.cardealer.dto.OrderDto;
import com.example.cardealer.exception.ErrorResponse;
import com.example.cardealer.service.OrderService;
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
@RequestMapping("/api/orders")
@Validated
@Tag(name = "Order Management", description = "API endpoints for managing vehicle orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @Operation(summary = "Get all orders",
            description = "Retrieves a list of all vehicle orders in the system",
            responses = {
                @ApiResponse(responseCode = "200", description = "Successfully retrieved order list"),
                @ApiResponse(responseCode = "500", description = "Internal server error",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            })
    @GetMapping
    public ResponseEntity<List<OrderDto>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @Operation(summary = "Get order by ID",
            description = "Retrieves a specific vehicle order by its unique identifier",
            responses = {
                @ApiResponse(responseCode = "200", description = "Order found and returned"),
                @ApiResponse(responseCode = "400", description = "Invalid order ID format",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(responseCode = "404", description = "Order not found",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            })
    @GetMapping("/{id}")
    public ResponseEntity<OrderDto> getOrderById(
            @Parameter(description = "Unique identifier of the order", required = true, example = "1")
            @PathVariable @Min(1) Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @Operation(summary = "Create new order",
            description = "Creates a new vehicle order in the system",
            responses = {
                @ApiResponse(responseCode = "201", description = "Order created successfully"),
                @ApiResponse(responseCode = "400", description = "Invalid order data",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(responseCode = "409", description = "One or more cars already ordered",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    @PostMapping
    public ResponseEntity<OrderDto> createOrder(
            @Parameter(description = "Order data including car IDs and user ID", required = true)
            @Valid @RequestBody OrderDto orderDto) {
        OrderDto createdOrder = orderService.createOrder(orderDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
    }

    @Operation(summary = "Update existing order",
            description = "Updates information for an existing vehicle order",
            responses = {
                @ApiResponse(responseCode = "200", description = "Order updated successfully"),
                @ApiResponse(responseCode = "400", description = "Invalid input data",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(responseCode = "404", description = "Order not found",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(responseCode = "409", description = "Car already in another order",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            })
    @PutMapping("/{id}")
    public ResponseEntity<OrderDto> updateOrder(
            @Parameter(description = "Unique identifier of the order to update", required = true, example = "1")
            @PathVariable @Min(1) Long id,
            @Parameter(description = "Updated order data including car IDs", required = true)
            @Valid @RequestBody OrderDto orderDto) {
        return ResponseEntity.ok(orderService.updateOrder(id, orderDto));
    }

    @Operation(summary = "Delete order",
            description = "Removes a vehicle order from the system",
            responses = {
                @ApiResponse(responseCode = "204", description = "Order deleted successfully"),
                @ApiResponse(responseCode = "400", description = "Invalid order ID format",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(responseCode = "404", description = "Order not found",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(
            @Parameter(description = "Unique identifier of the order to delete", required = true, example = "1")
            @PathVariable @Min(1) Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}