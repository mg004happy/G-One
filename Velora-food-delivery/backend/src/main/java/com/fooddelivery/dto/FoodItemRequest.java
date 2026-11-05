package com.fooddelivery.dto;

import com.fooddelivery.entity.Category;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * DTO for creating or updating a food item.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodItemRequest {

    @NotBlank(message = "Food item name is required")
    private String name;

    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than zero")
    private BigDecimal price;

    private String imageUrl;

    @Builder.Default
    private boolean available = true;

    private boolean veg;

    @NotNull(message = "Category is required")
    private Category category;

    @NotNull(message = "Restaurant ID is required")
    private Long restaurantId;
}
