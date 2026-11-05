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
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * JPA entity representing a saved delivery address.
 *
 * <h3>Relationships:</h3>
 * <ul>
 *   <li><strong>user</strong> — Many-to-One with {@link User}. One user can have many addresses.</li>
 * </ul>
 *
 * <h3>Business rules:</h3>
 * <ul>
 *   <li>Only one address per user can be marked as {@code isDefault = true}.</li>
 *   <li>When a new default is set, the previous default is automatically cleared in the service layer.</li>
 * </ul>
 */
@Entity
@Table(name = "addresses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String phoneNumber;

    @Column(nullable = false)
    private String street;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private String pincode;

    private String landmark;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AddressType addressType = AddressType.HOME;

    @Builder.Default
    @Column(nullable = false)
    private boolean isDefault = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // ---- Lifecycle ----

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // ---- Helper ----

    /**
     * Build a formatted one-line delivery address string for order snapshots.
     */
    public String toFormattedString() {
        StringBuilder sb = new StringBuilder();
        sb.append(street).append(", ").append(city).append(", ").append(state).append(" - ").append(pincode);
        if (landmark != null && !landmark.isBlank()) {
            sb.append(" (Near: ").append(landmark).append(")");
        }
        return sb.toString();
    }
}
