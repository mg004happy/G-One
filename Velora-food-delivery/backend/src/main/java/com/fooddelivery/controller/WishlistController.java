package com.fooddelivery.controller;

import com.fooddelivery.dto.WishlistResponse;
import com.fooddelivery.service.WishlistService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for wishlist/favourites management.
 * All endpoints are restricted to authenticated {@code CUSTOMER} users.
 */
@RestController
@RequestMapping("/api/wishlist")
@PreAuthorize("hasRole('CUSTOMER')")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    /**
     * Add a food item to the wishlist.
     */
    @PostMapping("/{foodItemId}")
    public ResponseEntity<WishlistResponse> addToWishlist(@PathVariable Long foodItemId) {
        WishlistResponse response = wishlistService.addToWishlist(foodItemId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get all wishlist items for the authenticated user.
     */
    @GetMapping
    public ResponseEntity<List<WishlistResponse>> getMyWishlist() {
        return ResponseEntity.ok(wishlistService.getMyWishlist());
    }

    /**
     * Remove a food item from the wishlist.
     */
    @DeleteMapping("/{foodItemId}")
    public ResponseEntity<Void> removeFromWishlist(@PathVariable Long foodItemId) {
        wishlistService.removeFromWishlist(foodItemId);
        return ResponseEntity.noContent().build();
    }
}
