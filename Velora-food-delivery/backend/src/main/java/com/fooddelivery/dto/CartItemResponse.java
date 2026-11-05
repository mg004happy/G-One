package com.fooddelivery.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for a single cart item returned to the client.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemResponse {

    private Long id;
    private Long foodItemId;
    private String foodItemName;
    private String foodItemImageUrl;
    private Long restaurantId;
    private String restaurantName;
    private boolean restaurantActive;
    private List<String> restaurantTieUpCompanies;
    private int quantity;
    private BigDecimal price;
    private BigDecimal subtotal;
}
