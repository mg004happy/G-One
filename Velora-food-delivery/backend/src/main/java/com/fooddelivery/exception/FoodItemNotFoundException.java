package com.fooddelivery.exception;

/**
 * Thrown when a food item referenced in a cart operation is not found.
 * Maps to HTTP 404 Not Found.
 */
public class FoodItemNotFoundException extends ResourceNotFoundException {

    public FoodItemNotFoundException(String message) {
        super(message);
    }
}
