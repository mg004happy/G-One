package com.fooddelivery.exception;

/**
 * Thrown when a review is not found.
 * Maps to HTTP 404 via {@link ResourceNotFoundException}.
 */
public class ReviewNotFoundException extends ResourceNotFoundException {

    public ReviewNotFoundException(String message) {
        super(message);
    }
}
