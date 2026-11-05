package com.fooddelivery.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for full order details returned to the client.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {

    private Long id;
    private String orderNumber;
    private String customerName;
    private String customerEmail;
    private Long restaurantId;
    private String restaurantName;
    private BigDecimal totalAmount;
    private BigDecimal grossAmount;
    private BigDecimal companyShareAmount;
    private String companyName;
    private String employeeId;
    private String deliveryAddress;
    private String phoneNumber;
    private String orderStatus;
    private String paymentMethod;
    private String paymentStatus;
    private List<OrderItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
