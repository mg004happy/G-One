package com.fooddelivery.exception;

/**
 * Thrown when a cart is not found for the authenticated user.
 * Maps to HTTP 404 Not Found.
 */
public class CartNotFoundException extends ResourceNotFoundException {

    public CartNotFoundException(String message) {
        super(message);
    }
}
