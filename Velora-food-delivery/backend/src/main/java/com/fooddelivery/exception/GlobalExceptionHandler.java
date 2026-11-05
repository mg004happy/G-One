package com.fooddelivery.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler providing consistent JSON error responses.
 *
 * <p>Each handler returns a body like:</p>
 * <pre>
 * {
 *   "timestamp": "2024-01-15T10:30:00",
 *   "status": 400,
 *   "error": "Bad Request",
 *   "message": "Validation failed",
 *   "details": { "email": "Please provide a valid email address" }
 * }
 * </pre>
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ---- Validation errors (400) ----

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(
            MethodArgumentNotValidException ex) {

        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        }

        Map<String, Object> body = buildErrorBody(
                HttpStatus.BAD_REQUEST, "Validation failed", fieldErrors);

        return ResponseEntity.badRequest().body(body);
    }

    // ---- Duplicate resource (409) ----

    @ExceptionHandler(ResourceAlreadyExistsException.class)
    public ResponseEntity<Map<String, Object>> handleResourceAlreadyExists(
            ResourceAlreadyExistsException ex) {

        Map<String, Object> body = buildErrorBody(
                HttpStatus.CONFLICT, ex.getMessage(), null);

        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolation(
            DataIntegrityViolationException ex) {
        Map<String, Object> body = buildErrorBody(
                HttpStatus.CONFLICT, "This email address or phone number is already in use", null);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    // ---- Not found (404) ----

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFound(
            ResourceNotFoundException ex) {

        Map<String, Object> body = buildErrorBody(
                HttpStatus.NOT_FOUND, ex.getMessage(), null);

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    // ---- Invalid credentials (401) ----

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidCredentials(
            InvalidCredentialsException ex) {

        Map<String, Object> body = buildErrorBody(
                HttpStatus.UNAUTHORIZED, ex.getMessage(), null);

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(
            BadCredentialsException ex) {

        Map<String, Object> body = buildErrorBody(
                HttpStatus.UNAUTHORIZED, "Invalid email or password", null);

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }

    // ---- Access denied (403) ----

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(
            AccessDeniedException ex) {

        Map<String, Object> body = buildErrorBody(
                HttpStatus.FORBIDDEN,
                "You do not have permission to access this resource", null);

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    // ---- Unauthorized operation (403) ----

    @ExceptionHandler(UnauthorizedOperationException.class)
    public ResponseEntity<Map<String, Object>> handleUnauthorizedOperation(
            UnauthorizedOperationException ex) {

        Map<String, Object> body = buildErrorBody(
                HttpStatus.FORBIDDEN, ex.getMessage(), null);

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    // ---- Bad request / business rule violation (400) ----

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalState(
            IllegalStateException ex) {

        Map<String, Object> body = buildErrorBody(
                HttpStatus.BAD_REQUEST, ex.getMessage(), null);

        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        Map<String, Object> body = buildErrorBody(HttpStatus.BAD_REQUEST, ex.getMessage(), null);
        return ResponseEntity.badRequest().body(body);
    }

    // ---- Empty cart (400) ----

    @ExceptionHandler(EmptyCartException.class)
    public ResponseEntity<Map<String, Object>> handleEmptyCart(
            EmptyCartException ex) {

        Map<String, Object> body = buildErrorBody(
                HttpStatus.BAD_REQUEST, ex.getMessage(), null);

        return ResponseEntity.badRequest().body(body);
    }

    // ---- Unauthorized order access (403) ----

    @ExceptionHandler(UnauthorizedOrderAccessException.class)
    public ResponseEntity<Map<String, Object>> handleUnauthorizedOrderAccess(
            UnauthorizedOrderAccessException ex) {

        Map<String, Object> body = buildErrorBody(
                HttpStatus.FORBIDDEN, ex.getMessage(), null);

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    // ---- Invalid payment (400) ----

    @ExceptionHandler(InvalidPaymentException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidPayment(
            InvalidPaymentException ex) {

        Map<String, Object> body = buildErrorBody(
                HttpStatus.BAD_REQUEST, ex.getMessage(), null);

        return ResponseEntity.badRequest().body(body);
    }

    // ---- User blocked (403) ----

    @ExceptionHandler(UserBlockedException.class)
    public ResponseEntity<Map<String, Object>> handleUserBlocked(
            UserBlockedException ex) {

        Map<String, Object> body = buildErrorBody(
                HttpStatus.FORBIDDEN, ex.getMessage(), null);

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    // ---- Duplicate review (409) ----

    @ExceptionHandler(DuplicateReviewException.class)
    public ResponseEntity<Map<String, Object>> handleDuplicateReview(
            DuplicateReviewException ex) {

        Map<String, Object> body = buildErrorBody(
                HttpStatus.CONFLICT, ex.getMessage(), null);

        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    // ---- Catch-all (500) ----

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {

        Map<String, Object> body = buildErrorBody(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred: " + ex.getMessage(), null);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    // ---- Helper ----

    private Map<String, Object> buildErrorBody(HttpStatus status, String message,
                                                Map<String, String> details) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        if (details != null && !details.isEmpty()) {
            body.put("details", details);
        }
        return body;
    }
}
