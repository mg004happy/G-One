package com.fooddelivery.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.LinkedHashSet;
import java.util.Set;

/**
 * JPA entity representing a restaurant in the food delivery system.
 *
 * <h3>Relationships:</h3>
 * <ul>
 *   <li><strong>owner</strong> — Many-to-One with {@link User}. Each restaurant belongs to one RESTAURANT_OWNER.</li>
 *   <li><strong>foodItems</strong> — One-to-Many with {@link FoodItem}. A restaurant has many food items.</li>
 * </ul>
 */
@Entity
@Table(name = "restaurants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String phone;

    private String imageUrl;

    @Column(nullable = false)
    private LocalTime openingTime;

    @Column(nullable = false)
    private LocalTime closingTime;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;

    @Builder.Default
    @Column(nullable = false)
    private boolean approved = false;

    @Builder.Default
    @Column(nullable = false)
    private boolean verified = false;

    @Builder.Default
    @Column(nullable = false)
    private boolean closedByAdmin = false;

    @ElementCollection
    @CollectionTable(name = "restaurant_company_tieups", joinColumns = @JoinColumn(name = "restaurant_id"))
    @Column(name = "company_name", nullable = false, length = 120)
    @Builder.Default
    private Set<String> tieUpCompanies = new LinkedHashSet<>();

    @Builder.Default
    @Column(nullable = false)
    private double averageRating = 0.0;

    @Builder.Default
    @Column(nullable = false)
    private int totalReviews = 0;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // ---- Relationships ----

    /**
     * The restaurant owner (User with role RESTAURANT_OWNER).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    /**
     * Food items offered by this restaurant.
     */
    @Builder.Default
    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<FoodItem> foodItems = new ArrayList<>();

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
