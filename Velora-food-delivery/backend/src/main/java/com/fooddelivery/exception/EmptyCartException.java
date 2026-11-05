package com.fooddelivery.exception;

/**
 * Thrown when a customer attempts to place an order with an empty cart.
 * Maps to HTTP 400 Bad Request.
 */
public class EmptyCartException extends RuntimeException {

    public EmptyCartException(String message) {
        super(message);
    }
}
