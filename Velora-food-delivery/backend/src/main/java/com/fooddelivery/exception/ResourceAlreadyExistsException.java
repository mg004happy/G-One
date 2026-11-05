package com.fooddelivery.exception;

/**
 * Thrown when attempting to create a resource that already exists (e.g. duplicate email).
 * Maps to HTTP 409 Conflict.
 */
public class ResourceAlreadyExistsException extends RuntimeException {

    public ResourceAlreadyExistsException(String message) {
        super(message);
    }
}
