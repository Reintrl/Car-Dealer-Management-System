package com.example.cardealer.repository;

import com.example.cardealer.model.Car;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repository for {@link Car} entities with custom queries.
 */
@Repository
public interface CarRepository extends JpaRepository<Car, Long> {

    /**
     * Finds cars by optional year range and max mileage filters.
     *
     * @param minYear Minimum year (inclusive, optional)
     * @param maxYear Maximum year (inclusive, optional)
     * @param maxMileage Maximum mileage (inclusive, optional)
     * @return List of matching cars
     */
    @Query("SELECT c FROM Car c WHERE "
            + "(:minYear IS NULL OR c.year >= :minYear) AND "
            + "(:maxYear IS NULL OR c.year <= :maxYear) AND "
            + "(:maxMileage IS NULL OR c.mileage <= :maxMileage)")
    List<Car> findByYearAndMileage(
            @Param("minYear") Integer minYear,
            @Param("maxYear") Integer maxYear,
            @Param("maxMileage") Double maxMileage);


    boolean existsByVin(@NotBlank(message = "VIN cannot be empty") @Size(min = 17, max = 17, message = "VIN must be exactly 17 characters") @Pattern(
            regexp = "^[A-HJ-NPR-Z\\d]{17}$",
            message = "Invalid VIN format. Must be alphanumeric (excluding I, O, Q)"
    ) String vin);

    List<Car> findByVinIn(List<String> vinsToCheck);
}
