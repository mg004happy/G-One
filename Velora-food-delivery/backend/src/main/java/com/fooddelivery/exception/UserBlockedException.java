package com.fooddelivery.exception;

/**
 * Thrown when a blocked user attempts to access a secured resource.
 * Maps to HTTP 403 Forbidden.
 */
public class UserBlockedException extends RuntimeException {

    public UserBlockedException(String message) {
        super(message);
    }
}
