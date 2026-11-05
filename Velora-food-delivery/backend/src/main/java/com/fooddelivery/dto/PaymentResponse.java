package com.fooddelivery.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for payment data returned to the client.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {

    private Long id;
    private String paymentId;
    private Long orderId;
    private String orderNumber;
    private String paymentMethod;
    private String paymentStatus;
    private BigDecimal amount;
    private String transactionId;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
}
