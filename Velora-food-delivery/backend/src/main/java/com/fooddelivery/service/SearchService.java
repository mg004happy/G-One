package com.fooddelivery.service;

import com.fooddelivery.dto.FoodItemResponse;
import com.fooddelivery.dto.RestaurantResponse;
import com.fooddelivery.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

/**
 * Service interface for search and recommendation operations.
 */
public interface SearchService {

    // ---- Search ----

    Page<RestaurantResponse> searchRestaurants(String keyword, Double minRating,
                                                String sortBy, Pageable pageable);

    Page<FoodItemResponse> searchFoods(String keyword, Category category, Boolean veg,
                                       BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);

    // ---- Recommendations ----

    List<RestaurantResponse> getTopRatedRestaurants(int limit);

    List<FoodItemResponse> getTrendingFoods(int limit);
}
