package com.fooddelivery.controller;

import com.fooddelivery.dto.FoodItemRequest;
import com.fooddelivery.dto.FoodItemResponse;
import com.fooddelivery.service.FoodItemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for food item management.
 *
 * <h3>Authorization:</h3>
 * <ul>
 *   <li>GET endpoints — public (accessible without authentication).</li>
 *   <li>POST / PUT / DELETE — restricted to {@code RESTAURANT_OWNER} role.
 *       Ownership of the parent restaurant is verified in the service layer.</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/foods")
public class FoodItemController {

    private final FoodItemService foodItemService;

    public FoodItemController(FoodItemService foodItemService) {
        this.foodItemService = foodItemService;
    }

    /**
     * Create a new food item.
     * Only RESTAURANT_OWNER can access this endpoint.
     */
    @PostMapping
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<FoodItemResponse> createFoodItem(
            @Valid @RequestBody FoodItemRequest request) {
        FoodItemResponse response = foodItemService.createFoodItem(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get all food items (public).
     */
    @GetMapping
    public ResponseEntity<List<FoodItemResponse>> getAllFoodItems() {
        List<FoodItemResponse> foods = foodItemService.getAllFoodItems();
        return ResponseEntity.ok(foods);
    }

    /**
     * Get a single food item by ID (public).
     */
    @GetMapping("/{id}")
    public ResponseEntity<FoodItemResponse> getFoodItemById(@PathVariable Long id) {
        FoodItemResponse response = foodItemService.getFoodItemById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all food items for a specific restaurant (public).
     */
    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<FoodItemResponse>> getFoodItemsByRestaurant(
            @PathVariable Long restaurantId) {
        List<FoodItemResponse> foods = foodItemService.getFoodItemsByRestaurantId(restaurantId);
        return ResponseEntity.ok(foods);
    }

    /**
     * Update a food item.
     * Only the owner of the parent restaurant can update.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<FoodItemResponse> updateFoodItem(
            @PathVariable Long id,
            @Valid @RequestBody FoodItemRequest request) {
        FoodItemResponse response = foodItemService.updateFoodItem(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete a food item.
     * Only the owner of the parent restaurant can delete.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<Void> deleteFoodItem(@PathVariable Long id) {
        foodItemService.deleteFoodItem(id);
        return ResponseEntity.noContent().build();
    }
}
