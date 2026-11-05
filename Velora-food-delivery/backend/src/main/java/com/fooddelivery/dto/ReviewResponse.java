package com.fooddelivery.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * DTO for review data returned to the client.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {

    private Long id;
    private String comment;
    private int rating;
    private Long userId;
    private String userName;
    private Long restaurantId;
    private String restaurantName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
