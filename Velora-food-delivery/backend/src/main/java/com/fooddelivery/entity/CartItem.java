package com.fooddelivery.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * JPA entity representing a single line item inside a {@link Cart}.
 *
 * <h3>Relationships:</h3>
 * <ul>
 *   <li><strong>cart</strong> — Many-to-One with {@link Cart}.</li>
 *   <li><strong>foodItem</strong> — Many-to-One with {@link FoodItem}.</li>
 * </ul>
 *
 * <p>The {@code subtotal} is always {@code price × quantity} and is recalculated
 * whenever quantity or price changes via {@link #recalculateSubtotal()}.</p>
 */
@Entity
@Table(name = "cart_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_item_id", nullable = false)
    private FoodItem foodItem;

    @Column(nullable = false)
    private int quantity;

    /**
     * Snapshot of the food item's price at the time it was added.
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    /**
     * Computed field: price × quantity.
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    // ---- Helper ----

    /**
     * Recalculate the subtotal based on current price and quantity.
     */
    public void recalculateSubtotal() {
        this.subtotal = this.price.multiply(BigDecimal.valueOf(this.quantity));
    }
}
