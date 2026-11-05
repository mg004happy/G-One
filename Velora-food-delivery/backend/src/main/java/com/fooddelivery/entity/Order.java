package com.fooddelivery.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * JPA entity representing a customer order.
 *
 * <h3>Relationships:</h3>
 * <ul>
 *   <li><strong>user</strong> — Many-to-One with {@link User}. The customer who placed the order.</li>
 *   <li><strong>restaurant</strong> — Many-to-One with {@link Restaurant}. The restaurant fulfilling the order.</li>
 *   <li><strong>deliveryAddressRef</strong> — Many-to-One with {@link Address}. The saved address used for this order (nullable — the string snapshot fields are the source of truth).</li>
 *   <li><strong>orderItems</strong> — One-to-Many with {@link OrderItem}. Line items in this order.</li>
 * </ul>
 */
@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    /** Full item subtotal before the customer/company split. */
    @Column(precision = 10, scale = 2)
    private BigDecimal grossAmount;

    /** Amount payable by the tied-up company to the restaurant. */
    @Builder.Default
    @Column(precision = 10, scale = 2)
    private BigDecimal companyShareAmount = BigDecimal.ZERO;

    @Column(length = 120)
    private String companyName;

    @Column(length = 80)
    private String employeeIdSnapshot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_employee_id")
    private RestaurantEmployee registeredEmployee;

    @Column(nullable = false)
    private String deliveryAddress;

    @Column(nullable = false)
    private String phoneNumber;

    /**
     * Reference to the saved address used for this order.
     * Nullable — address may be deleted after order is placed.
     * The string fields above serve as immutable snapshots.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_address_id")
    private Address deliveryAddressRef;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private OrderStatus orderStatus = OrderStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Builder.Default
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<OrderItem> orderItems = new ArrayList<>();

    // ---- Lifecycle ----

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
