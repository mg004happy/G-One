package com.fooddelivery.controller;

import com.fooddelivery.dto.PaymentRequest;
import com.fooddelivery.dto.PaymentResponse;
import com.fooddelivery.dto.PaymentVerificationRequest;
import com.fooddelivery.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for payment operations.
 *
 * <h3>Authorization:</h3>
 * <ul>
 *   <li><strong>Create / Verify</strong> — CUSTOMER only.</li>
 *   <li><strong>Get by ID</strong> — CUSTOMER or ADMIN.</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * Create a payment record for an order.
     */
    @PostMapping("/create/{orderId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PaymentResponse> createPayment(
            @PathVariable Long orderId,
            @Valid @RequestBody PaymentRequest request) {
        PaymentResponse response = paymentService.createPayment(orderId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Verify/confirm a simulated online payment.
     */
    @PostMapping("/verify")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PaymentResponse> verifyPayment(
            @Valid @RequestBody PaymentVerificationRequest request) {
        PaymentResponse response = paymentService.verifyPayment(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Get payment details by payment ID.
     */
    @GetMapping("/{paymentId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<PaymentResponse> getPayment(@PathVariable String paymentId) {
        PaymentResponse response = paymentService.getPaymentByPaymentId(paymentId);
        return ResponseEntity.ok(response);
    }

}
