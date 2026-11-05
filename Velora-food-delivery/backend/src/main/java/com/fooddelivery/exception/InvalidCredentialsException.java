package com.fooddelivery.exception;

/**
 * Thrown when login credentials are invalid.
 * Maps to HTTP 401 Unauthorized.
 */
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException(String message) {
        super(message);
    }
}
