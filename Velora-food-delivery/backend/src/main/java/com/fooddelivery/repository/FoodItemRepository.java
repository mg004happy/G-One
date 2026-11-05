package com.fooddelivery.repository;

import com.fooddelivery.entity.Category;
import com.fooddelivery.entity.FoodItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

/**
 * Spring Data JPA repository for {@link FoodItem} entities.
 */
@Repository
public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {

    /**
     * Find all food items belonging to a specific restaurant.
     */
    List<FoodItem> findByRestaurantId(Long restaurantId);

    List<FoodItem> findByRestaurantIdAndAvailableTrue(Long restaurantId);

    List<FoodItem> findByAvailableTrue();

    // ---- Search queries ----

    /**
     * Advanced food search with optional filters.
     * All filters are applied via COALESCE/null-check pattern so
     * passing null for any parameter effectively disables that filter.
     */
    @Query("SELECT f FROM FoodItem f WHERE f.available = true AND f.restaurant.active = true AND f.restaurant.approved = true " +
           "AND LOWER(f.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "AND (:category IS NULL OR f.category = :category) " +
           "AND (:veg IS NULL OR f.veg = :veg) " +
           "AND (:minPrice IS NULL OR f.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR f.price <= :maxPrice)")
    Page<FoodItem> searchFoods(
            @Param("keyword") String keyword,
            @Param("category") Category category,
            @Param("veg") Boolean veg,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable);

    // ---- Recommendation queries ----

    /**
     * Most ordered food items (by total quantity sold across delivered orders).
     * Returns Object[] with [FoodItem.id, FoodItem.name, totalQuantity].
     */
    @Query("SELECT oi.foodItem.id, oi.foodItem.name, SUM(oi.quantity) " +
           "FROM OrderItem oi JOIN oi.order o " +
                "WHERE o.orderStatus = com.fooddelivery.entity.OrderStatus.DELIVERED " +
                "AND oi.foodItem.restaurant.active = true AND oi.foodItem.restaurant.approved = true " +
           "GROUP BY oi.foodItem.id, oi.foodItem.name " +
           "ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> findMostOrderedFoods(Pageable pageable);
}
