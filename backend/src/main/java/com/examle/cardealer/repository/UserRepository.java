package com.example.cardealer.repository;

import com.example.cardealer.model.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for managing {@link User} entities.
 * Extends {@link JpaRepository} to provide CRUD operations and custom query methods for users.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByUsername(@NotBlank(message = "Username cannot be blank")
                             @Size(min = 3, max = 20, message = "Username must be between 3 and 20 characters")
                             @Pattern(
                                     regexp = "^\\w+$",
                                     message = "Username can only contain letters, numbers and underscores"
                             ) String username);
}
