package com.example.cardealer.mapper;


import com.example.cardealer.dto.CarDto;
import com.example.cardealer.model.Car;
import com.example.cardealer.model.Dealer;
import com.example.cardealer.model.Order;
import com.example.cardealer.model.User;
import com.example.cardealer.repository.DealerRepository;
import com.example.cardealer.repository.OrderRepository;
import com.example.cardealer.repository.UserRepository;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * Mapper for converting between Car and CarDto.
 */
@Component
public class CarMapper {

    private final DealerRepository dealerRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    /**
     * Constructor for CarMapper.
     *
     * @param dealerRepository the dealer repository
     * @param orderRepository  the order repository
     * @param userRepository   the user repository
     */
    public CarMapper(DealerRepository dealerRepository,
                     OrderRepository orderRepository,
                     UserRepository userRepository) {
        this.dealerRepository = dealerRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    /**
     * Converts a Car entity to a CarDto.
     *
     * @param car the car entity
     * @return the car DTO
     */
    public CarDto toDto(Car car) {
        CarDto carDto = new CarDto();
        carDto.setId(car.getId());
        carDto.setVin(car.getVin());
        carDto.setModel(car.getModel());
        carDto.setBrand(car.getBrand());
        carDto.setYear(car.getYear());
        carDto.setPrice(car.getPrice());
        carDto.setColor(car.getColor());
        carDto.setMileage(car.getMileage());
        carDto.setDealerId(car.getDealer().getId());

        // Map users who favorited the car
        if (car.getUsersWhoFavorited() != null) {
            carDto.setUserIdsWhoFavorited(car.getUsersWhoFavorited().stream()
                    .map(User::getId)
                    .toList());
        } else {
            carDto.setUserIdsWhoFavorited(new ArrayList<>()); // Initialize empty list
        }

        carDto.setOrderId(car.getOrder() != null ? car.getOrder().getId() : null);
        return carDto;
    }

    /**
     * Converts a CarDto to a Car entity.
     *
     * @param carDto the car DTO
     * @return the car entity
     */
    public Car toEntity(CarDto carDto) {
        Car car = new Car();
        car.setId(carDto.getId());
        car.setVin(carDto.getVin());
        car.setModel(carDto.getModel());
        car.setBrand(carDto.getBrand());
        car.setYear(carDto.getYear());
        car.setPrice(carDto.getPrice());
        car.setColor(carDto.getColor());
        car.setMileage(carDto.getMileage());

        // Load dealer by ID
        if (carDto.getDealerId() != null) {
            Dealer dealer = dealerRepository.findById(carDto.getDealerId()).orElseThrow(
                    () -> new RuntimeException("Dealer not found with id: " + carDto.getDealerId())
            );
            car.setDealer(dealer);
        }

        // Load order by ID
        if (carDto.getOrderId() != null) {
            Order order = orderRepository.findById(carDto.getOrderId()).orElseThrow(
                    () -> new RuntimeException("Order not found with id: " + carDto.getOrderId())
            );
            car.setOrder(order);
        }

        // Load users who favorited the car
        if (carDto.getUserIdsWhoFavorited() != null) {
            List<User> users = userRepository.findAllById(carDto.getUserIdsWhoFavorited());
            car.setUsersWhoFavorited(users);
        }

        return car;
    }

    /**
     * Updates a Car entity with data from a CarDto.
     *
     * @param carDto the car DTO with updated data
     * @param car    the car entity to update
     */
    public void updateEntity(CarDto carDto, Car car) {
        if (carDto.getVin() != null) {
            car.setVin(carDto.getVin());
        }
        if (carDto.getModel() != null) {
            car.setModel(carDto.getModel());
        }
        if (carDto.getBrand() != null) {
            car.setBrand(carDto.getBrand());
        }
        if (carDto.getYear() != 0) {
            car.setYear(carDto.getYear());
        }
        if (carDto.getPrice() != 0) {
            car.setPrice(carDto.getPrice());
        }
        if (carDto.getColor() != null) {
            car.setColor(carDto.getColor());
        }
        if (carDto.getMileage() != 0) {
            car.setMileage(carDto.getMileage());
        }

        // Update dealer
        if (carDto.getDealerId() != null) {
            Dealer dealer = dealerRepository.findById(carDto.getDealerId())
                    .orElseThrow(() -> new RuntimeException("Dealer not found"));
            car.setDealer(dealer);
        }

        // Update order
        if (carDto.getOrderId() != null) {
            Order order = orderRepository.findById(carDto.getOrderId())
                    .orElseThrow(() -> new RuntimeException("Order not found"));
            car.setOrder(order);
        }

        // Update users who favorited the car
        if (carDto.getUserIdsWhoFavorited() != null) {
            List<User> users = userRepository.findAllById(carDto.getUserIdsWhoFavorited());
            car.setUsersWhoFavorited(users);
        }
    }
}
