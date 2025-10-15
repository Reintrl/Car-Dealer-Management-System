package com.example.cardealer.service;

import com.example.cardealer.constants.ErrorMessages;
import com.example.cardealer.dto.CarDto;
import com.example.cardealer.dto.DealerDto;
import com.example.cardealer.exception.ConflictException;
import com.example.cardealer.exception.ResourceNotFoundException;
import com.example.cardealer.exception.ValidationException;
import com.example.cardealer.mapper.CarMapper;
import com.example.cardealer.mapper.DealerMapper;
import com.example.cardealer.model.Car;
import com.example.cardealer.model.Dealer;
import com.example.cardealer.model.Order;
import com.example.cardealer.model.User;
import com.example.cardealer.repository.CarRepository;
import com.example.cardealer.repository.DealerRepository;
import com.example.cardealer.repository.OrderRepository;
import com.example.cardealer.repository.UserRepository;
import jakarta.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * Service for managing dealers.
 */
@Service
@Transactional
public class DealerService {

    private final CarRepository carRepository;
    private final DealerRepository dealerRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final DealerMapper dealerMapper;
    private final CarMapper carMapper;

    /**
     * Constructor for DealerService.
     *
     * @param dealerRepository the dealer repository
     * @param dealerMapper     the dealer mapper
     */
    public DealerService(CarRepository carRepository,
                         DealerRepository dealerRepository,
                         OrderRepository orderRepository,
                         UserRepository userRepository,
                         DealerMapper dealerMapper,
                         CarMapper carMapper) {
        this.carRepository = carRepository;
        this.dealerRepository = dealerRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.dealerMapper = dealerMapper;
        this.carMapper = carMapper;
    }

    /**
     * Retrieves all dealers.
     *
     * @return a list of all dealers
     */
    public List<DealerDto> getAllDealers() {
        return dealerRepository.findAll().stream()
                .map(dealerMapper::toDto)
                .toList();
    }

    /**
     * Retrieves a dealer by its ID.
     *
     * @param id the dealer ID
     * @return the dealer DTO
     * @throws ResourceNotFoundException if the dealer is not found
     */
    public DealerDto getDealerById(Long id) {
        if (id == null || id < 1) {
            throw new ValidationException(ErrorMessages.INVALID_DEALER_ID);
        }

        Dealer dealer = dealerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.DEALER_NOT_FOUND + id));

        return dealerMapper.toDto(dealer);
    }

    /**
     * Retrieves all cars belonging to a specific dealer.
     *
     * @param dealerId the ID of the dealer
     * @return list of cars belonging to the dealer
     * @throws ResourceNotFoundException if dealer is not found
     */
    public List<CarDto> getDealerCars(Long dealerId) {
        if (dealerId == null || dealerId < 1) {
            throw new ValidationException(ErrorMessages.INVALID_DEALER_ID);
        }

        Dealer dealer = dealerRepository.findById(dealerId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.DEALER_NOT_FOUND + dealerId));

        return dealer.getCars().stream()
                .map(carMapper::toDto)
                .toList();
    }

    /**
     * Creates a new dealer.
     *
     * @param dealerDto the dealer DTO
     * @return the created dealer DTO
     */
    public DealerDto createDealer(DealerDto dealerDto) {
        validateDealerDto(dealerDto);

        if (dealerRepository.existsByName(dealerDto.getName())) {
            throw new ConflictException(ErrorMessages.NAME_ALREADY_EXISTS);
        }
        if (dealerRepository.existsByPhoneNumber(dealerDto.getPhoneNumber())) {
            throw new ConflictException(ErrorMessages.PHONE_ALREADY_EXISTS);
        }
        if (dealerRepository.existsByAddress(dealerDto.getAddress())) {
            throw new ConflictException(ErrorMessages.ADDRESS_ALREADY_EXISTS);
        }

        Dealer dealer = dealerMapper.toEntity(dealerDto);

        Dealer savedDealer = dealerRepository.save(dealer);
        return dealerMapper.toDto(savedDealer);
    }

    public DealerDto updateDealer(Long id, DealerDto dealerDto) {
        if (id == null || id < 1) {
            throw new ValidationException(ErrorMessages.INVALID_DEALER_ID);
        }

        validateDealerDto(dealerDto);

        Dealer existingDealer = dealerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.DEALER_NOT_FOUND + id));

        // Проверка уникальности имени, если оно изменилось
        if (!existingDealer.getName().equals(dealerDto.getName())
                && dealerRepository.existsByName(dealerDto.getName())) {
            throw new ConflictException(ErrorMessages.NAME_ALREADY_EXISTS);
        }

        // Проверка уникальности телефона, если он изменился
        if (!existingDealer.getPhoneNumber().equals(dealerDto.getPhoneNumber())
                && dealerRepository.existsByPhoneNumber(dealerDto.getPhoneNumber())) {
            throw new ConflictException(ErrorMessages.PHONE_ALREADY_EXISTS);
        }

        // Проверка уникальности адреса, если он изменился
        if (!existingDealer.getAddress().equals(dealerDto.getAddress())
                && dealerRepository.existsByAddress(dealerDto.getAddress())) {
            throw new ConflictException(ErrorMessages.ADDRESS_ALREADY_EXISTS);
        }


        // Собираем бренды в список
        List<String> affectedBrands = new ArrayList<>();
        for (Car car : existingDealer.getCars()) {
            affectedBrands.add(car.getBrand());
        }

        dealerMapper.updateEntity(dealerDto, existingDealer);

        // Обновляем автомобили и добавляем новые бренды
        if (existingDealer.getCars() != null) {
            carRepository.saveAll(existingDealer.getCars());
            for (Car car : existingDealer.getCars()) {
                if (!affectedBrands.contains(car.getBrand())) {
                    affectedBrands.add(car.getBrand());
                }
            }
        }

        Dealer updatedDealer = dealerRepository.save(existingDealer);
        return dealerMapper.toDto(updatedDealer);
    }

    /**
     * Deletes a dealer by its ID.
     *
     * @param id the dealer ID
     */
    public void deleteDealer(Long id) {
        if (id == null || id < 1) {
            throw new ValidationException(ErrorMessages.INVALID_DEALER_ID);
        }

        Dealer dealer = dealerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.DEALER_NOT_FOUND + id));

        // Собираем бренды в список
        List<String> affectedBrands = new ArrayList<>();
        for (Car car : dealer.getCars()) {
            affectedBrands.add(car.getBrand());
        }

        // 1. Удаляем все машины дилера (машина не существует без дилера)
        for (Car car : new ArrayList<>(dealer.getCars())) {
            // Удаляем связи с пользователями (избранное)
            for (User user : new ArrayList<>(car.getUsersWhoFavorited())) {
                user.getFavoriteCars().remove(car);
                userRepository.save(user);
            }

            // Если машина в заказе - удаляем заказ
            if (car.getOrder() != null) {
                Order order = car.getOrder();
                // Удаляем связь у других машин в заказе
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

        // 2. Удаляем самого дилера
        dealerRepository.delete(dealer);
    }

    public List<DealerDto> getDealersByBrand(String brand) {
        if (brand == null || brand.length() < 2 || brand.length() > 50) {
            throw new ValidationException(ErrorMessages.INVALID_BRAND);
        }

        List<Dealer> dealers = dealerRepository.findDealersWithBrand(brand);

        return dealers.stream()
                .map(dealerMapper::toDto)
                .toList();
    }

    public List<DealerDto> getDealersByBrandNative(String brand) {
        if (brand == null || brand.length() < 2 || brand.length() > 50) {
            throw new ValidationException(ErrorMessages.INVALID_BRAND);
        }

        List<Dealer> dealers = dealerRepository.findDealersWithBrandNative(brand);
        return dealers.stream()
                .map(dealerMapper::toDto)
                .toList();
    }

    public void validateDealerDto(DealerDto dealerDto) {
        if (dealerDto == null) {
            throw new ValidationException(ErrorMessages.DEALER_DATA_NULL);
        }

        // Validate name
        if (dealerDto.getName() == null || dealerDto.getName().trim().isEmpty()) {
            throw new ValidationException("Dealer name cannot be empty");
        }
        if (dealerDto.getName().length() > 100) {
            throw new ValidationException("Dealer name cannot exceed 100 characters");
        }
        if (!dealerDto.getName().matches("^[\\p{L}0-9 .'-]+$")) {
            throw new ValidationException("Dealer name contains invalid characters");
        }

        // Validate address
        if (dealerDto.getAddress() == null || dealerDto.getAddress().trim().isEmpty()) {
            throw new ValidationException("Dealer address cannot be empty");
        }
        if (dealerDto.getAddress().length() > 200) {
            throw new ValidationException("Dealer address cannot exceed 200 characters");
        }

        // Validate phone number
        if (dealerDto.getPhoneNumber() == null || dealerDto.getPhoneNumber().trim().isEmpty()) {
            throw new ValidationException("Phone number cannot be empty");
        }
        if (!dealerDto.getPhoneNumber().matches("^\\+?[0-9\\s()-]{10,20}$")) {
            throw new ValidationException("Invalid phone number format");
        }
    }
}