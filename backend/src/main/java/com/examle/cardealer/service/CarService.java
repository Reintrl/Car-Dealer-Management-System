package com.example.cardealer.service;


import com.example.cardealer.constants.ErrorMessages;
import com.example.cardealer.dto.CarDto;
import com.example.cardealer.exception.ConflictException;
import com.example.cardealer.exception.ResourceNotFoundException;
import com.example.cardealer.exception.ValidationException;
import com.example.cardealer.mapper.CarMapper;
import com.example.cardealer.model.Car;
import com.example.cardealer.model.Order;
import com.example.cardealer.model.User;
import com.example.cardealer.repository.CarRepository;
import com.example.cardealer.repository.OrderRepository;
import com.example.cardealer.repository.UserRepository;
import jakarta.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;


/**
 * Service for managing cars.
 */
@Service
@Transactional
public class CarService {

    private final CarRepository carRepository;
    private final CarMapper carMapper;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;


    /**
     * Constructor for CarService.
     *
     * @param carRepository    the car repository
     * @param carMapper        the car mapper
     * @param orderRepository  the order repository
     * @param userRepository   the user repository
     */
    public CarService(CarRepository carRepository,
                      CarMapper carMapper,
                      OrderRepository orderRepository,
                      UserRepository userRepository) {
        this.carRepository = carRepository;
        this.carMapper = carMapper;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    public List<CarDto> getAllCars() {
        return carRepository.findAll().stream()
                .map(carMapper::toDto)
                .toList();
    }

    public CarDto getCarById(Long id) {
        if (id == null || id < 1) {
            throw new ValidationException(ErrorMessages.INVALID_CAR_ID + id);
        }

        Car car = carRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.CAR_NOT_FOUND + id));
        return carMapper.toDto(car);
    }

    public List<CarDto> createCarsBulk(List<CarDto> carDtos) {
        // Проверка всех DTO перед обработкой
        for (CarDto dto : carDtos) {
            validateCarDto(dto);
        }

        // Проверка на существующие VIN в базе
        List<String> vinsToCheck = carDtos.stream()
                .map(CarDto::getVin)
                .filter(Objects::nonNull)
                .toList();

        List<Car> existingCars = carRepository.findByVinIn(vinsToCheck);
        if (!existingCars.isEmpty()) {
            String existingVins = existingCars.stream()
                    .map(Car::getVin)
                    .collect(Collectors.joining(", "));
            throw new ConflictException(ErrorMessages.VIN_ALREADY_EXISTS + existingVins);
        }

        // Маппинг и сохранение
        List<Car> carsToSave = carDtos.stream()
                .map(carMapper::toEntity)
                .toList();

        List<Car> savedCars = carRepository.saveAll(carsToSave);

        return savedCars.stream()
                .map(carMapper::toDto)
                .toList();
    }

    public CarDto createCar(CarDto carDto) {
        validateCarDto(carDto);

        // Проверка на дубликат VIN
        if (carRepository.existsByVin(carDto.getVin())) {
            throw new ConflictException(ErrorMessages.VIN_ALREADY_EXISTS + carDto.getVin());
        }

        Car car = carMapper.toEntity(carDto);
        Car savedCar = carRepository.save(car);

        return carMapper.toDto(savedCar);
    }

    public CarDto updateCar(Long id, CarDto carDto) {
        if (id == null || id < 1) {
            throw new ValidationException(ErrorMessages.INVALID_CAR_ID + id);
        }

        validateCarDto(carDto);

        Car existingCar = carRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.CAR_NOT_FOUND + id));

        String oldBrand = existingCar.getBrand();
        System.out.println("Updating car, old brand: " + oldBrand);

        if (!existingCar.getVin().equals(carDto.getVin())) {
            throw new ValidationException(ErrorMessages.VIN_CHANGE_NOT_ALLOWED + carDto.getVin());
        }

        // Обновляем entity из DTO
        carMapper.updateEntity(carDto, existingCar);

        Car updatedCar = carRepository.save(existingCar);
        return carMapper.toDto(updatedCar);
    }

    public void deleteCar(Long id) {
        if (id == null || id < 1) {
            throw new ValidationException(ErrorMessages.INVALID_CAR_ID + id);
        }

        Car car = carRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.CAR_NOT_FOUND + id));

        for (User user : new ArrayList<>(car.getUsersWhoFavorited())) {
            user.getFavoriteCars().remove(car);
            userRepository.save(user);
        }

        if (car.getOrder() != null) {
            Order order = car.getOrder();
            for (Car otherCar : new ArrayList<>(order.getCars())) {
                if (!otherCar.getId().equals(car.getId())) {
                    otherCar.setOrder(null);
                    carRepository.save(otherCar);
                }
            }
            orderRepository.delete(order);
        }

        carRepository.delete(car);
    }

    public List<CarDto> findCarsByYearAndMileage(Integer minYear, Integer maxYear, Double maxMileage) {
        List<Car> cars = carRepository.findByYearAndMileage(minYear, maxYear, maxMileage);
        return cars.stream()
                .map(carMapper::toDto)
                .toList();
    }

    public void validateCarDto(CarDto carDto) {
        if (carDto == null) {
            throw new ValidationException(ErrorMessages.CAR_DATA_NULL);
        }

        if (carDto.getVin().trim().isEmpty()) {
            throw new ValidationException(ErrorMessages.VIN_EMPTY);
        }

        if (carDto.getVin().length() != 17) {
            throw new ValidationException(ErrorMessages.INVALID_VIN_LENGTH);
        }
        if (!carDto.getVin().matches("^[A-HJ-NPR-Z0-9]{17}$")) {
            throw new ValidationException(ErrorMessages.INVALID_VIN_FORMAT);
        }

        if (carDto.getModel() == null || carDto.getModel().trim().isEmpty()) {
            throw new ValidationException(ErrorMessages.MODEL_EMPTY);
        }
        if (carDto.getModel().length() > 50) {
            throw new ValidationException(ErrorMessages.MODEL_TOO_LONG);
        }

        if (carDto.getBrand() == null || carDto.getBrand().trim().isEmpty()) {
            throw new ValidationException(ErrorMessages.BRAND_EMPTY);
        }
        if (carDto.getBrand().length() > 50) {
            throw new ValidationException(ErrorMessages.BRAND_TOO_LONG);
        }

        int currentYear = java.time.Year.now().getValue();
        if (carDto.getYear() < 1886 || carDto.getYear() > currentYear + 1) {
            throw new ValidationException(String.format(ErrorMessages.INVALID_YEAR_RANGE, 1886, currentYear + 1));
        }

        // Validate price
        if (carDto.getPrice() <= 0) {
            throw new ValidationException(ErrorMessages.PRICE_POSITIVE);
        }

        // Validate mileage
        if (carDto.getMileage() < 0) {
            throw new ValidationException(ErrorMessages.MILEAGE_NEGATIVE);
        }

        // Validate color
        if (carDto.getColor() == null || carDto.getColor().trim().isEmpty()) {
            throw new ValidationException(ErrorMessages.COLOR_EMPTY);
        }
        if (carDto.getColor().length() > 30) {
            throw new ValidationException(ErrorMessages.COLOR_TOO_LONG);
        }
        if (!carDto.getColor().matches("^[a-zA-Z\\s-]+$")) {
            throw new ValidationException(ErrorMessages.COLOR_INVALID);
        }

        // Validate dealer ID if present
        if (carDto.getDealerId() != null && carDto.getDealerId() < 1) {
            throw new ValidationException(ErrorMessages.INVALID_DEALER_ID);
        }
    }
}
