package com.fooddelivery.repository;

import com.fooddelivery.entity.Restaurant;
import com.fooddelivery.entity.Review;
import com.fooddelivery.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for {@link Review} entities.
 */
@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    /**
     * Find all reviews for a restaurant, most recent first (paginated).
     */
    Page<Review> findByRestaurantOrderByCreatedAtDesc(Restaurant restaurant, Pageable pageable);

    /**
     * Check if a user has already reviewed a restaurant.
     */
    boolean existsByUserAndRestaurant(User user, Restaurant restaurant);

    /**
     * Find a specific review by user and restaurant.
     */
    Optional<Review> findByUserAndRestaurant(User user, Restaurant restaurant);

    /**
     * Calculate the average rating for a restaurant.
     */
    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r WHERE r.restaurant = :restaurant")
    double findAverageRatingByRestaurant(@Param("restaurant") Restaurant restaurant);

    /**
     * Count total reviews for a restaurant.
     */
    long countByRestaurant(Restaurant restaurant);
}
