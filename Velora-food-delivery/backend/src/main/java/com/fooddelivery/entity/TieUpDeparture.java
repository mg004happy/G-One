package com.fooddelivery.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "tie_up_departures")
@Getter
@Setter
@NoArgsConstructor
public class TieUpDeparture {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 160)
    private String customerName;

    @Column(nullable = false, length = 255)
    private String customerEmail;

    @Column(length = 24)
    private String phoneNumber;

    @Column(nullable = false, length = 120)
    private String companyName;

    @Column(length = 80)
    private String employeeId;

    @Column(nullable = false)
    private LocalDateTime leftAt;

    @PrePersist
    protected void onCreate() {
        if (leftAt == null) leftAt = LocalDateTime.now();
    }
}
