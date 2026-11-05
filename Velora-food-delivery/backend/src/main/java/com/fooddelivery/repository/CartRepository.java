package com.fooddelivery.repository;

import com.fooddelivery.entity.Cart;
import com.fooddelivery.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for {@link Cart} entities.
 */
@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    /**
     * Find the cart belonging to a specific user.
     *
     * @param user the cart owner
     * @return an Optional containing the cart if it exists
     */
    Optional<Cart> findByUser(User user);
}
