package com.fooddelivery.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * JPA entity representing a wishlist/favourite item.
 *
 * <h3>Relationships:</h3>
 * <ul>
 *   <li><strong>user</strong> — Many-to-One with {@link User}.</li>
 *   <li><strong>foodItem</strong> — Many-to-One with {@link FoodItem}.</li>
 * </ul>
 *
 * <h3>Constraints:</h3>
 * <ul>
 *   <li>A unique constraint on (user_id, food_item_id) prevents duplicate wishlist entries.</li>
 * </ul>
 */
@Entity
@Table(name = "wishlists", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "food_item_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wishlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_item_id", nullable = false)
    private FoodItem foodItem;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // ---- Lifecycle ----

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
