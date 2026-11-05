package com.fooddelivery.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO for verifying/confirming a simulated online payment.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentVerificationRequest {

    @NotBlank(message = "Payment ID is required")
    private String paymentId;

    @NotBlank(message = "Transaction ID is required")
    private String transactionId;

    /**
     * Simulates the payment outcome. Set to true for success, false for failure.
     */
    private boolean success;
}
