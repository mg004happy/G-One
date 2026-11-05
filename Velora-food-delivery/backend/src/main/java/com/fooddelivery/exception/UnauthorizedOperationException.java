package com.fooddelivery.exception;

/**
 * Thrown when a user attempts an operation they do not own / are not authorized to perform.
 * Maps to HTTP 403 Forbidden.
 */
public class UnauthorizedOperationException extends RuntimeException {

    public UnauthorizedOperationException(String message) {
        super(message);
    }
}
