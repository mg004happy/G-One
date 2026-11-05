package com.fooddelivery.repository;

import com.fooddelivery.entity.Restaurant;
import com.fooddelivery.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for {@link Restaurant} entities.
 */
@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

    /**
     * Find all restaurants owned by a specific user.
     */
    List<Restaurant> findByOwner(User owner);

    /** Restaurants that customers are allowed to discover and order from. */
    List<Restaurant> findByActiveTrueAndApprovedTrue();

    @Query("SELECT DISTINCT company FROM Restaurant r JOIN r.tieUpCompanies company " +
           "WHERE r.approved = true ORDER BY company")
    List<String> findDistinctApprovedTieUpCompanies();

    // ---- Admin: paginated ----

    /**
     * Search restaurants by name (case-insensitive) with pagination.
     */
    @Query("SELECT r FROM Restaurant r WHERE " +
           "LOWER(r.name) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Restaurant> searchByName(@Param("search") String search, Pageable pageable);

    // ---- Analytics ----

    long countByApprovedTrue();

    long countByApprovedFalse();

    // ---- Search & Recommendation queries ----

    /**
     * Advanced restaurant search with optional keyword and minimum rating filter.
     * Only returns active restaurants.
     */
    @Query("SELECT r FROM Restaurant r WHERE r.active = true AND r.approved = true " +
           "AND (:keyword IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:minRating IS NULL OR r.averageRating >= :minRating)")
    Page<Restaurant> searchRestaurants(
            @Param("keyword") String keyword,
            @Param("minRating") Double minRating,
            Pageable pageable);

    /**
     * Top-rated restaurants (active only), ordered by average rating descending.
     */
    @Query("SELECT r FROM Restaurant r WHERE r.active = true AND r.approved = true AND r.totalReviews > 0 " +
           "ORDER BY r.averageRating DESC")
    List<Restaurant> findTopRatedRestaurants(Pageable pageable);
}
