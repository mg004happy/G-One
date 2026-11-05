package com.fooddelivery.exception;

/**
 * Thrown when a delivery address is not found.
 * Maps to HTTP 404 Not Found.
 */
public class AddressNotFoundException extends ResourceNotFoundException {

    public AddressNotFoundException(String message) {
        super(message);
    }
}
