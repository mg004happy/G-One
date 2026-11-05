package com.fooddelivery.exception;

/**
 * Thrown when a cart item is not found.
 * Maps to HTTP 404 Not Found.
 */
public class CartItemNotFoundException extends ResourceNotFoundException {

    public CartItemNotFoundException(String message) {
        super(message);
    }
}
