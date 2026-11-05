package com.fooddelivery.repository;

import com.fooddelivery.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for {@link CartItem} entities.
 */
@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
}
