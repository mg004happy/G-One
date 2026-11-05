package com.fooddelivery.exception;

/**
 * Thrown when a payment operation is invalid (e.g. duplicate payment, already paid).
 * Maps to HTTP 400 Bad Request.
 */
public class InvalidPaymentException extends RuntimeException {

    public InvalidPaymentException(String message) {
        super(message);
    }
}
