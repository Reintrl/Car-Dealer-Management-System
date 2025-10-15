package com.example.cardealer.mapper;

import com.example.cardealer.dto.OrderDto;
import com.example.cardealer.model.Car;
import com.example.cardealer.model.Order;
import com.example.cardealer.model.User;
import com.example.cardealer.repository.CarRepository;
import com.example.cardealer.repository.UserRepository;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * Mapper for converting between Order and OrderDto.
 */
@Component
public class OrderMapper {

    private final UserRepository userRepository;
    private final CarRepository carRepository;

    /**
     * Constructor for OrderMapper.
     *
     * @param userRepository the user repository
     * @param carRepository  the car repository
     */
    public OrderMapper(UserRepository userRepository,
                       CarRepository carRepository) {
        this.userRepository = userRepository;
        this.carRepository = carRepository;
    }

    /**
     * Converts an Order entity to an OrderDto.
     *
     * @param order the order entity
     * @return the order DTO
     */
    public OrderDto toDto(Order order) {
        OrderDto orderDto = new OrderDto();
        orderDto.setId(order.getId());
        orderDto.setOrderDate(order.getOrderDate());
        orderDto.setTotalPrice(order.getTotalPrice());
        orderDto.setUserId(order.getUser().getId());

        // Map car IDs
        if (order.getCars() != null) {
            orderDto.setCarIds(order.getCars().stream()
                    .map(Car::getId)
                    .toList());
        } else {
            orderDto.setCarIds(new ArrayList<>()); // Initialize empty list
        }

        return orderDto;
    }

    /**
     * Converts an OrderDto to an Order entity.
     *
     * @param orderDto the order DTO
     * @return the order entity
     */
    public Order toEntity(OrderDto orderDto) {
        Order order = new Order();
        order.setId(orderDto.getId());
        order.setOrderDate(orderDto.getOrderDate());
        order.setTotalPrice(orderDto.getTotalPrice());

        // Load user by ID
        if (orderDto.getUserId() != null) {
            User user = userRepository.findById(orderDto.getUserId()).orElseThrow(
                    () -> new RuntimeException("User not found with id: " + orderDto.getUserId())
            );
            order.setUser(user);
        }

        // Load cars by their IDs
        if (orderDto.getCarIds() != null) {
            List<Car> cars = carRepository.findAllById(orderDto.getCarIds());
            order.setCars(cars);
        }

        return order;
    }

    /**
     * Updates an Order entity with data from an OrderDto.
     *
     * @param orderDto the order DTO with updated data
     * @param order    the order entity to update
     */
    public void updateEntity(OrderDto orderDto, Order order) {
        if (orderDto.getOrderDate() != null) {
            order.setOrderDate(orderDto.getOrderDate());
        }
        if (orderDto.getTotalPrice() != 0) {
            order.setTotalPrice(orderDto.getTotalPrice());
        }

        // Update user
        if (orderDto.getUserId() != null) {
            User user = userRepository.findById(orderDto.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            order.setUser(user);
        }

        // Update car list
        if (orderDto.getCarIds() != null) {
            List<Car> cars = carRepository.findAllById(orderDto.getCarIds());
            order.setCars(cars);
        }
    }
}