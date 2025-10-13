package com.example.cardealer.repository;

import com.example.cardealer.model.Dealer;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for managing {@link Dealer} entities.
 * Extends {@link JpaRepository} to provide CRUD operations for dealers.
 */
@Repository
public interface DealerRepository extends JpaRepository<Dealer, Long> {

    @Query("SELECT DISTINCT d FROM Dealer d "
            + "JOIN d.cars c WHERE LOWER(c.brand) = LOWER(:brand)")
    List<Dealer> findDealersWithBrand(@Param("brand") String brand);

    @Query(value =
            "SELECT DISTINCT d.* FROM dealers d "
                + "JOIN cars c ON d.id = c.dealer_id "
                        + "WHERE LOWER(c.brand) = LOWER(:brand)",
            nativeQuery = true)
    List<Dealer> findDealersWithBrandNative(@Param("brand") String brand);

    boolean existsByName(@NotBlank(message = "Dealer name cannot be empty")
                         @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
                         @Pattern(
                                 regexp = "^[a-zA-Z0-9\\s\\-.,&]+$",
                                 message = "Name can only contain letters, numbers, spaces, hyphens, commas, dots, and ampersands"
                         ) String name);

    boolean existsByPhoneNumber(@NotBlank(message = "Phone number cannot be empty") @Pattern(
            regexp = "^\\+?[0-9\\s\\-()]{7,20}$",
            message = "Invalid phone number format. Use digits, spaces, hyphens, or parentheses"
    ) String phoneNumber);

    boolean existsByAddress(@NotBlank(message = "Address cannot be empty")
                            @Size(min = 5, max = 200, message = "Address must be between 5 and 200 characters") String address);
}
