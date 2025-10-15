package com.example.cardealer.service;

import com.example.cardealer.constants.ErrorMessages;
import com.example.cardealer.dto.OrderDto;
import com.example.cardealer.exception.ConflictException;
import com.example.cardealer.exception.ResourceNotFoundException;
import com.example.cardealer.exception.ValidationException;
import com.example.cardealer.mapper.OrderMapper;
import com.example.cardealer.model.Car;
import com.example.cardealer.model.Order;
import com.example.cardealer.model.User;
import com.example.cardealer.repository.CarRepository;
import com.example.cardealer.repository.OrderRepository;
import jakarta.transaction.Transactional;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * Service for managing orders.
 */
@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final CarRepository carRepository;

    /**
     * Constructor for OrderService.
     *
     * @param orderRepository the order repository
     * @param orderMapper     the order mapper
     * @param carRepository   the car repository
     */
    public OrderService(OrderRepository orderRepository,
                        OrderMapper orderMapper,
                        CarRepository carRepository) {
        this.orderRepository = orderRepository;
        this.orderMapper = orderMapper;
        this.carRepository = carRepository;
    }

    /**
     * Retrieves all orders.
     *
     * @return a list of all orders
     */
    public List<OrderDto> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(orderMapper::toDto)
                .toList();
    }

    /**
     * Retrieves an order by its ID.
     *
     * @param id the order ID
     * @return the order DTO
     * @throws ResourceNotFoundException if the order is not found
     */
    public OrderDto getOrderById(Long id) {
        if (id == null || id < 1) {
            throw new ValidationException(ErrorMessages.INVALID_ORDER_ID);
        }

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.ORDER_NOT_FOUND + id));
        return orderMapper.toDto(order);
    }

    /**
     * Creates a new order.
     *
     * @param orderDto the order DTO
     * @return the created order DTO
     * @throws IllegalStateException if a car is already ordered
     */
    public OrderDto createOrder(OrderDto orderDto) {
        validateOrderDto(orderDto);

        Order order = orderMapper.toEntity(orderDto);
        order.setOrderDate(Date.from(ZonedDateTime.now(ZoneId.of("Europe/Moscow")).toInstant()));

        List<Car> cars = validateAndGetOrderCars(orderDto.getCarIds());
        validateCarsNotOrdered(cars);

        double totalPrice = calculateTotalPrice(cars);
        order.setTotalPrice(totalPrice);
        order.setCars(new ArrayList<>());

        Order savedOrder = orderRepository.save(order);

        associateCarsWithOrder(cars, savedOrder);
        return orderMapper.toDto(savedOrder);
    }

    /**
     * Updates an existing order.
     *
     * @param id       the order ID
     * @param orderDto the updated order DTO
     * @return the updated order DTO
     * @throws ResourceNotFoundException       if the order is not found
     * @throws IllegalStateException if a car is already ordered
     */
    public OrderDto updateOrder(Long id, OrderDto orderDto) {
        if (id == null || id < 1) {
            throw new ValidationException(ErrorMessages.INVALID_ORDER_ID);
        }
        validateOrderDto(orderDto);

        Order existingOrder = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.ORDER_NOT_FOUND + id));

        List<Car> cars = validateAndGetOrderCars(orderDto.getCarIds());
        validateCarsNotOrdered(cars, existingOrder.getId());

        orderMapper.updateEntity(orderDto, existingOrder);
        existingOrder.setOrderDate(Date.from(ZonedDateTime.now(ZoneId.of("GMT+3")).toInstant()));
        existingOrder.setTotalPrice(calculateTotalPrice(cars));

        Order updatedOrder = orderRepository.save(existingOrder);
        updateCarAssociations(existingOrder, cars);

        return orderMapper.toDto(updatedOrder);
    }

    /**
     * Deletes an order by its ID.
     *
     * @param id the order ID
     * @throws ResourceNotFoundException if the order is not found
     */
    public void deleteOrder(Long id) {
        if (id == null || id < 1) {
            throw new ValidationException(ErrorMessages.INVALID_ORDER_ID);
        }

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.ORDER_NOT_FOUND + id));

        disassociateCarsFromOrder(order);
        disassociateUserFromOrder(order);

        orderRepository.delete(order);
    }

    private void validateOrderDto(OrderDto orderDto) {
        if (orderDto == null) {
            throw new ValidationException(ErrorMessages.ORDER_DATA_NULL);
        }
        if (orderDto.getCarIds() == null || orderDto.getCarIds().isEmpty()) {
            throw new ValidationException(ErrorMessages.ORDER_NO_CARS);
        }
        if (orderDto.getUserId() == null) {
            throw new ValidationException(ErrorMessages.ORDER_NO_USER);
        }
    }

    private List<Car> validateAndGetOrderCars(List<Long> carIds) {
        List<Car> cars = new ArrayList<>();
        for (Long carId : carIds) {
            Car car = carRepository.findById(carId)
                    .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.CAR_NOT_FOUND + carId));
            cars.add(car);
        }
        return cars;
    }

    private void validateCarsNotOrdered(List<Car> cars) {
        for (Car car : cars) {
            if (car.getOrder() != null) {
                throw new ConflictException(String.format(ErrorMessages.CAR_ALREADY_ORDERED, car.getId()));
            }
        }
    }

    private void validateCarsNotOrdered(List<Car> cars, Long excludeOrderId) {
        for (Car car : cars) {
            if (car.getOrder() != null && !car.getOrder().getId().equals(excludeOrderId)) {
                throw new ConflictException(String.format(ErrorMessages.CAR_ALREADY_ORDERED, car.getId()));
            }
        }
    }

    private double calculateTotalPrice(List<Car> cars) {
        return cars.stream()
                .mapToDouble(Car::getPrice)
                .sum();
    }

    private void associateCarsWithOrder(List<Car> cars, Order order) {
        for (Car car : cars) {
            car.setOrder(order);
            carRepository.save(car);
            order.getCars().add(car);
        }
    }

    private void updateCarAssociations(Order order, List<Car> newCars) {
        // Remove order reference from old cars no longer in the order
        for (Car oldCar : new ArrayList<>(order.getCars())) {
            if (!newCars.contains(oldCar)) {
                oldCar.setOrder(null);
                carRepository.save(oldCar);
                order.getCars().remove(oldCar);
            }
        }

        // Add order reference to new cars
        for (Car newCar : newCars) {
            if (!order.getCars().contains(newCar)) {
                newCar.setOrder(order);
                carRepository.save(newCar);
                order.getCars().add(newCar);
            }
        }
    }

    private void disassociateCarsFromOrder(Order order) {
        for (Car car : new ArrayList<>(order.getCars())) {
            car.setOrder(null);
            carRepository.save(car);
        }
    }

    private void disassociateUserFromOrder(Order order) {
        User user = order.getUser();
        if (user != null) {
            user.getOrders().remove(order);
        }
    }
}