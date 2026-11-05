package com.fooddelivery.exception;

/**
 * Thrown when an order is not found.
 * Maps to HTTP 404 Not Found.
 */
public class OrderNotFoundException extends ResourceNotFoundException {

    public OrderNotFoundException(String message) {
        super(message);
    }
}
