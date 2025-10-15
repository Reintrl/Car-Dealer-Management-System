package com.example.cardealer.mapper;

import com.example.cardealer.dto.UserDto;
import com.example.cardealer.model.Car;
import com.example.cardealer.model.Order;
import com.example.cardealer.model.User;
import com.example.cardealer.repository.CarRepository;
import com.example.cardealer.repository.OrderRepository;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * Mapper for converting between User and UserDto.
 */
@Component
public class UserMapper {

    private final CarRepository carRepository;
    private final OrderRepository orderRepository;

    /**
     * Constructor for UserMapper.
     *
     * @param carRepository   the car repository
     * @param orderRepository the order repository
     */
    public UserMapper(CarRepository carRepository,
                      OrderRepository orderRepository) {
        this.carRepository = carRepository;
        this.orderRepository = orderRepository;
    }

    /**
     * Converts a User entity to a UserDto.
     *
     * @param user the user entity
     * @return the user DTO
     */
    public UserDto toDto(User user) {
        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setUsername(user.getUsername());

        // Map favorite car IDs
        if (user.getFavoriteCars() != null) {
            userDto.setFavoriteCarIds(user.getFavoriteCars().stream()
                    .map(Car::getId)
                    .toList());
        } else {
            userDto.setFavoriteCarIds(new ArrayList<>()); // Initialize empty list
        }

        // Map order IDs
        if (user.getOrders() != null) {
            userDto.setOrderIds(user.getOrders().stream()
                    .map(Order::getId)
                    .toList());
        } else {
            userDto.setOrderIds(new ArrayList<>()); // Initialize empty list
        }

        return userDto;
    }

    /**
     * Converts a UserDto to a User entity.
     *
     * @param userDto the user DTO
     * @return the user entity
     */
    public User toEntity(UserDto userDto) {
        User user = new User();
        user.setId(userDto.getId());
        user.setUsername(userDto.getUsername());

        // Load favorite cars by their IDs
        if (userDto.getFavoriteCarIds() != null) {
            List<Car> favoriteCars = carRepository.findAllById(userDto.getFavoriteCarIds());
            user.setFavoriteCars(favoriteCars);
        }

        // Load orders by their IDs
        if (userDto.getOrderIds() != null) {
            List<Order> orders = orderRepository.findAllById(userDto.getOrderIds());
            user.setOrders(orders);
        }

        return user;
    }

    /**
     * Updates a User entity with data from a UserDto.
     *
     * @param userDto the user DTO with updated data
     * @param user    the user entity to update
     */
    public void updateEntity(UserDto userDto, User user) {
        if (userDto.getUsername() != null) {
            user.setUsername(userDto.getUsername());
        }

        // Update favorite cars
        if (userDto.getFavoriteCarIds() != null) {
            List<Car> favoriteCars = carRepository.findAllById(userDto.getFavoriteCarIds());
            user.setFavoriteCars(favoriteCars);
        }

        // Update orders
        if (userDto.getOrderIds() != null) {
            List<Order> orders = orderRepository.findAllById(userDto.getOrderIds());
            user.setOrders(orders);
        }
    }
}