package com.fooddelivery.repository;

import com.fooddelivery.entity.FoodItem;
import com.fooddelivery.entity.User;
import com.fooddelivery.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for {@link Wishlist} entities.
 */
@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    /**
     * Find all wishlist items for a user, most recent first.
     */
    List<Wishlist> findByUserOrderByCreatedAtDesc(User user);

    /**
     * Find a wishlist entry by user and food item.
     */
    Optional<Wishlist> findByUserAndFoodItem(User user, FoodItem foodItem);

    /**
     * Check if a food item is already in the user's wishlist.
     */
    boolean existsByUserAndFoodItem(User user, FoodItem foodItem);
}
