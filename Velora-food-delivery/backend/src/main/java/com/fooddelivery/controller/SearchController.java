package com.fooddelivery.controller;

import com.fooddelivery.dto.FoodItemResponse;
import com.fooddelivery.dto.RestaurantResponse;
import com.fooddelivery.entity.Category;
import com.fooddelivery.service.SearchService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

/**
 * REST controller for search and recommendation APIs.
 *
 * <p>All endpoints are <strong>public</strong> — no authentication required.</p>
 */
@RestController
@RequestMapping("/api")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    // =====================================================================
    // SEARCH
    // =====================================================================

    /**
     * Search restaurants by keyword and/or minimum rating.
     *
     * <p>Example: {@code GET /api/search/restaurants?keyword=pizza&minRating=4.0&page=0&size=10&sortBy=averageRating}</p>
     */
    @GetMapping("/search/restaurants")
    public ResponseEntity<Page<RestaurantResponse>> searchRestaurants(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Double minRating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "averageRating") String sortBy,
            @RequestParam(defaultValue = "DESC") Sort.Direction dir) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sortBy));
        return ResponseEntity.ok(
                searchService.searchRestaurants(keyword, minRating, sortBy, pageable));
    }

    /**
     * Search food items with multiple filters.
     *
     * <p>Example: {@code GET /api/search/foods?keyword=burger&category=BURGER&veg=false&minPrice=5&maxPrice=20&page=0&size=10&sortBy=price}</p>
     */
    @GetMapping("/search/foods")
    public ResponseEntity<Page<FoodItemResponse>> searchFoods(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Category category,
            @RequestParam(required = false) Boolean veg,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "ASC") Sort.Direction dir) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sortBy));
        return ResponseEntity.ok(
                searchService.searchFoods(keyword, category, veg, minPrice, maxPrice, pageable));
    }

    // =====================================================================
    // RECOMMENDATIONS
    // =====================================================================

    /**
     * Get top-rated restaurants.
     *
     * <p>Example: {@code GET /api/recommendations/top-restaurants?limit=10}</p>
     */
    @GetMapping("/recommendations/top-restaurants")
    public ResponseEntity<List<RestaurantResponse>> getTopRatedRestaurants(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(searchService.getTopRatedRestaurants(limit));
    }

    /**
     * Get trending (most ordered) food items.
     *
     * <p>Example: {@code GET /api/recommendations/trending-foods?limit=10}</p>
     */
    @GetMapping("/recommendations/trending-foods")
    public ResponseEntity<List<FoodItemResponse>> getTrendingFoods(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(searchService.getTrendingFoods(limit));
    }
}
