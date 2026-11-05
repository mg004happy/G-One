package com.fooddelivery.exception;

/**
 * Thrown when a payment record is not found.
 * Maps to HTTP 404 Not Found.
 */
public class PaymentNotFoundException extends ResourceNotFoundException {

    public PaymentNotFoundException(String message) {
        super(message);
    }
}
