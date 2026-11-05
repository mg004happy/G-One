package com.fooddelivery.exception;

/**
 * Thrown when a user tries to access or modify an order they do not own.
 * Maps to HTTP 403 Forbidden.
 */
public class UnauthorizedOrderAccessException extends RuntimeException {

    public UnauthorizedOrderAccessException(String message) {
        super(message);
    }
}
