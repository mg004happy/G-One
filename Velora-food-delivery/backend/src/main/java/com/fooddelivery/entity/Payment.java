package com.fooddelivery.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * JPA entity representing a payment record for an order.
 *
 * <h3>Relationship:</h3>
 * <ul>
 *   <li><strong>order</strong> — One-to-One with {@link Order}. Each order has exactly one payment.</li>
 * </ul>
 *
 * <h3>Fields:</h3>
 * <ul>
 *   <li>{@code paymentId} — A unique, system-generated payment identifier (e.g. PAY-20260527-ABC123).</li>
 *   <li>{@code transactionId} — An external transaction ID from the payment gateway (null for COD).</li>
 *   <li>{@code paidAt} — Timestamp when payment was confirmed; null until paid.</li>
 * </ul>
 */
@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String paymentId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    /**
     * External transaction ID from the payment gateway.
     * Null for CASH_ON_DELIVERY orders.
     */
    private String transactionId;

    /**
     * Timestamp when payment was confirmed.
     * Null until payment succeeds.
     */
    private LocalDateTime paidAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // ---- Lifecycle ----

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
