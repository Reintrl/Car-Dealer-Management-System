package com.example.cardealer.mapper;

import com.example.cardealer.dto.DealerDto;
import com.example.cardealer.model.Car;
import com.example.cardealer.model.Dealer;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * Mapper for converting between Dealer and DealerDto.
 */
@Component
public class DealerMapper {

    private final CarMapper carMapper;

    /**
     * Constructor for DealerMapper.
     *
     * @param carMapper the car mapper
     */
    public DealerMapper(CarMapper carMapper) {
        this.carMapper = carMapper;
    }

    /**
     * Converts a Dealer entity to a DealerDto.
     *
     * @param dealer the dealer entity
     * @return the dealer DTO
     */
    public DealerDto toDto(Dealer dealer) {
        DealerDto dealerDto = new DealerDto();
        dealerDto.setId(dealer.getId());
        dealerDto.setName(dealer.getName());
        dealerDto.setAddress(dealer.getAddress());
        dealerDto.setPhoneNumber(dealer.getPhoneNumber());

        // Маппинг списка Car в CarDto
        if (dealer.getCars() != null) {
            dealerDto.setCars(dealer.getCars().stream()
                    .map(carMapper::toDto)
                    .toList());
        } else {
            dealerDto.setCars(new ArrayList<>());
        }

        return dealerDto;
    }

    /**
     * Converts a DealerDto to a Dealer entity.
     *
     * @param dealerDto the order DTO
     * @return the dealer entity
     */
    public Dealer toEntity(DealerDto dealerDto) {
        Dealer dealer = new Dealer();
        dealer.setId(dealerDto.getId());
        dealer.setName(dealerDto.getName());
        dealer.setAddress(dealerDto.getAddress());
        dealer.setPhoneNumber(dealerDto.getPhoneNumber());

        // Маппинг списка CarDto в Car (только если есть ID)
        if (dealerDto.getCars() != null) {
            List<Car> cars = dealerDto.getCars().stream()
                    .filter(carDto -> carDto.getId() != null)
                    .map(carMapper::toEntity)
                    .toList();
            dealer.setCars(cars);
        }

        return dealer;
    }

    /**
     * Updates a Dealer entity with data from a DealerDto.
     *
     * @param dealerDto the dealer DTO with updated data
     * @param dealer the dealer entity to update
     */
    public void updateEntity(DealerDto dealerDto, Dealer dealer) {
        if (dealerDto.getName() != null) {
            dealer.setName(dealerDto.getName());
        }
        if (dealerDto.getAddress() != null) {
            dealer.setAddress(dealerDto.getAddress());
        }
        if (dealerDto.getPhoneNumber() != null) {
            dealer.setPhoneNumber(dealerDto.getPhoneNumber());
        }

        // Обновление списка автомобилей
        if (dealerDto.getCars() != null) {
            List<Car> updatedCars = dealerDto.getCars().stream()
                    .filter(carDto -> carDto.getId() != null)
                    .map(carMapper::toEntity)
                    .toList();
            dealer.setCars(updatedCars);
        }
    }
}