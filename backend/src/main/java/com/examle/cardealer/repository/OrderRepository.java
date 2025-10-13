package com.example.cardealer.repository;

import com.example.cardealer.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for managing {@link Order} entities.
 * Extends {@link JpaRepository} to provide CRUD operations and custom query methods for orders.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {}