package com.fooddelivery.controller;

import com.fooddelivery.dto.RestaurantRequest;
import com.fooddelivery.dto.RestaurantResponse;
import com.fooddelivery.dto.RestaurantAvailabilityRequest;
import com.fooddelivery.dto.TieUpCompaniesRequest;
import com.fooddelivery.service.RestaurantService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for restaurant management.
 *
 * <h3>Authorization:</h3>
 * <ul>
 *   <li>GET endpoints — public (accessible without authentication).</li>
 *   <li>POST / PUT / DELETE — restricted to {@code RESTAURANT_OWNER} role.
 *       Ownership of the specific restaurant is verified in the service layer.</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {

    private final RestaurantService restaurantService;

    public RestaurantController(RestaurantService restaurantService) {
        this.restaurantService = restaurantService;
    }

    /**
     * Create a new restaurant.
     * Only RESTAURANT_OWNER can access this endpoint.
     */
    @PostMapping
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<RestaurantResponse> createRestaurant(
            @Valid @RequestBody RestaurantRequest request) {
        RestaurantResponse response = restaurantService.createRestaurant(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get all restaurants (public).
     */
    @GetMapping
    public ResponseEntity<List<RestaurantResponse>> getAllRestaurants() {
        List<RestaurantResponse> restaurants = restaurantService.getAllRestaurants();
        return ResponseEntity.ok(restaurants);
    }

    /**
     * Get a single restaurant by ID (public).
     */
    @GetMapping("/{identifier}")
    public ResponseEntity<RestaurantResponse> getRestaurantByIdentifier(@PathVariable String identifier) {
        RestaurantResponse response = restaurantService.getRestaurantByIdentifier(identifier);
        return ResponseEntity.ok(response);
    }

    /**
     * Update an existing restaurant.
     * Only the owner of the restaurant can update it.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<RestaurantResponse> updateRestaurant(
            @PathVariable Long id,
            @Valid @RequestBody RestaurantRequest request) {
        RestaurantResponse response = restaurantService.updateRestaurant(id, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/tie-ups")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<RestaurantResponse> updateRestaurantTieUps(
            @PathVariable Long id,
            @Valid @RequestBody TieUpCompaniesRequest request) {
        return ResponseEntity.ok(restaurantService.updateTieUpCompanies(id, request.getTieUpCompanies()));
    }

    /** Let the restaurant owner open or close their restaurant for customer orders. */
    @PatchMapping("/{id}/availability")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<RestaurantResponse> setRestaurantAvailability(
            @PathVariable Long id,
            @Valid @RequestBody RestaurantAvailabilityRequest request) {
        RestaurantResponse response = restaurantService.setRestaurantAvailability(id, request.getActive());
        return ResponseEntity.ok(response);
    }

    /**
     * Delete a restaurant.
     * Only the owner of the restaurant can delete it.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<Void> deleteRestaurant(@PathVariable Long id) {
        restaurantService.deleteRestaurant(id);
        return ResponseEntity.noContent().build();
    }
}
