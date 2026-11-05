package com.fooddelivery.exception;

/**
 * Thrown when a wishlist item is not found.
 * Maps to HTTP 404 via {@link ResourceNotFoundException}.
 */
public class WishlistItemNotFoundException extends ResourceNotFoundException {

    public WishlistItemNotFoundException(String message) {
        super(message);
    }
}
