package com.fooddelivery.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for a wishlist item returned to the client.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistResponse {

    private Long id;
    private Long foodItemId;
    private String foodItemName;
    private String foodItemImageUrl;
    private BigDecimal foodItemPrice;
    private String restaurantName;
    private boolean available;
    private boolean restaurantActive;
    private LocalDateTime createdAt;
}
