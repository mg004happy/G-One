package com.fooddelivery.exception;

/**
 * Thrown when a user attempts to review a restaurant they have already reviewed.
 * Maps to HTTP 409 Conflict.
 */
public class DuplicateReviewException extends RuntimeException {

    public DuplicateReviewException(String message) {
        super(message);
    }
}
