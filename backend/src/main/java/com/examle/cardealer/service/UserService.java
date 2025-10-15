package com.example.cardealer.service;

import com.example.cardealer.constants.ErrorMessages;
import com.example.cardealer.dto.UserDto;
import com.example.cardealer.exception.ConflictException;
import com.example.cardealer.exception.ResourceNotFoundException;
import com.example.cardealer.exception.ValidationException;
import com.example.cardealer.mapper.UserMapper;
import com.example.cardealer.model.Car;
import com.example.cardealer.model.Order;
import com.example.cardealer.model.User;
import com.example.cardealer.repository.CarRepository;
import com.example.cardealer.repository.OrderRepository;
import com.example.cardealer.repository.UserRepository;
import jakarta.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * Service for managing users.
 */
@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final CarRepository carRepository;
    private final OrderRepository orderRepository;

    /**
     * Constructor for UserService.
     *
     * @param userRepository the user repository
     * @param userMapper     the user mapper
     * @param carRepository  the car repository
     */
    public UserService(UserRepository userRepository,
                       UserMapper userMapper,
                       CarRepository carRepository,
                       OrderRepository orderRepository) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.carRepository = carRepository;
        this.orderRepository = orderRepository;
    }

    /**
     * Retrieves all users.
     *
     * @return a list of all users
     */
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toDto)
                .toList();
    }

    /**
     * Retrieves a user by their ID.
     *
     * @param id the user ID
     * @return the user DTO
     * @throws ResourceNotFoundException if the user is not found
     */
    public UserDto getUserById(Long id) {
        if (id == null || id < 1) {
            throw new ValidationException(ErrorMessages.INVALID_USER_ID);
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.USER_NOT_FOUND + id));
        return userMapper.toDto(user);
    }

    /**
     * Creates a new user.
     *
     * @param userDto the user DTO
     * @return the created user DTO
     */
    public UserDto createUser(UserDto userDto) {
        validateUserDto(userDto);

        if (userRepository.existsByUsername(userDto.getUsername())) {
            throw new ConflictException(ErrorMessages.USERNAME_ALREADY_EXISTS);
        }

        User user = userMapper.toEntity(userDto);
        User savedUser = userRepository.save(user);
        return userMapper.toDto(savedUser);
    }

    /**
     * Updates an existing user.
     *
     * @param id      the user ID
     * @param userDto the updated user DTO
     * @return the updated user DTO
     * @throws ResourceNotFoundException if the user is not found
     */
    public UserDto updateUser(Long id, UserDto userDto) {
        if (id == null || id < 1) {
            throw new ValidationException(ErrorMessages.INVALID_USER_ID);
        }
        validateUserDto(userDto);

        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.USER_NOT_FOUND + id));

        if (!existingUser.getUsername().equals(userDto.getUsername())) {
            if (userRepository.existsByUsername(userDto.getUsername())) {
                throw new ConflictException(ErrorMessages.USERNAME_ALREADY_EXISTS);
            }
            existingUser.setUsername(userDto.getUsername());
        }

        userMapper.updateEntity(userDto, existingUser);
        User updatedUser = userRepository.save(existingUser);
        return userMapper.toDto(updatedUser);
    }

    /**
     * Deletes a user by their ID.
     *
     * @param id the user ID
     * @throws ResourceNotFoundException if the user is not found
     */
    public void deleteUser(Long id) {
        if (id == null || id < 1) {
            throw new ValidationException(ErrorMessages.INVALID_USER_ID);
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.USER_NOT_FOUND + id));

        removeFavoriteCarsAssociations(user);
        deleteUserOrders(user);

        // Явная очистка коллекций
        user.getFavoriteCars().clear();
        user.getOrders().clear();

        userRepository.delete(user);
    }

    /**
     * Adds a car to the user's favorite list.
     *
     * @param userId the user ID
     * @param carId  the car ID
     * @throws ResourceNotFoundException       if the user or car is not found
     * @throws IllegalStateException if the car is already in favorites
     */
    public void addFavoriteCar(Long userId, Long carId) {
        validateIds(userId, carId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.USER_NOT_FOUND + userId));

        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.CAR_NOT_FOUND + carId));

        if (user.getFavoriteCars().contains(car)) {
            throw new ConflictException(ErrorMessages.CAR_ALREADY_FAVORITED);
        }

        user.getFavoriteCars().add(car);
        car.getUsersWhoFavorited().add(user);

        userRepository.save(user);
        carRepository.save(car);
    }

    /**
     * Removes a car from the user's favorite list.
     *
     * @param userId the user ID
     * @param carId  the car ID
     * @throws ResourceNotFoundException if the user or car is not found
     */
    public void removeFavoriteCar(Long userId, Long carId) {
        validateIds(userId, carId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.USER_NOT_FOUND + userId));

        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.CAR_NOT_FOUND + carId));

        if (!user.getFavoriteCars().contains(car)) {
            throw new ResourceNotFoundException(ErrorMessages.CAR_NOT_IN_FAVORITES);
        }

        user.getFavoriteCars().remove(car);
        car.getUsersWhoFavorited().remove(user);

        userRepository.save(user);
        carRepository.save(car);
    }

    public void validateUserDto(UserDto userDto) {
        if (userDto == null) {
            throw new ValidationException(ErrorMessages.USER_DATA_NULL);
        }
        if (userDto.getUsername() == null || userDto.getUsername().trim().isEmpty()) {
            throw new ValidationException(ErrorMessages.USERNAME_EMPTY);
        }
    }

    protected void validateIds(Long userId, Long carId) {
        if (userId == null || userId < 1) {
            throw new ValidationException(ErrorMessages.INVALID_USER_ID);
        }
        if (carId == null || carId < 1) {
            throw new ValidationException(ErrorMessages.INVALID_CAR_ID);
        }
    }

    private void removeFavoriteCarsAssociations(User user) {
        List<Car> cars = new ArrayList<>(user.getFavoriteCars());
        for (Car car : cars) {
            car.getUsersWhoFavorited().remove(user);
            carRepository.save(car);
            // Удаление из коллекции пользователя
            user.getFavoriteCars().remove(car);
        }
    }

    private void deleteUserOrders(User user) {
        for (Order order : new ArrayList<>(user.getOrders())) {
            for (Car car : new ArrayList<>(order.getCars())) {
                if (car != null) { // Проверка на null
                    car.setOrder(null);
                    carRepository.save(car);
                }
            }
            orderRepository.delete(order);
        }
    }
}