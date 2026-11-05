package com.fooddelivery.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Set;

/**
 * DTO for restaurant data returned to the client.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantResponse {

    private Long id;
    private String name;
    private String description;
    private String address;
    private String phone;
    private String imageUrl;
    private LocalTime openingTime;
    private LocalTime closingTime;
    private boolean active;
    private boolean approved;
    private boolean closedByAdmin;
    private Set<String> tieUpCompanies;
    private Long ownerId;
    private String ownerName;
    private String ownerEmail;
    private double averageRating;
    private int totalReviews;
    private LocalDateTime createdAt;
}
