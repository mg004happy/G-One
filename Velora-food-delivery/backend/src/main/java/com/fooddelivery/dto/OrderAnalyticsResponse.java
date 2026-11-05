package com.fooddelivery.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Map;

/**
 * DTO for order analytics data.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderAnalyticsResponse {

    /**
     * Order count grouped by status (e.g. PENDING=5, DELIVERED=20).
     */
    private Map<String, Long> ordersByStatus;

    /**
     * Top-selling food items: food item name → total quantity sold.
     */
    private List<TopSellingFoodItem> topSellingFoods;

    /**
     * Most active restaurants by order count.
     */
    private List<ActiveRestaurant> mostActiveRestaurants;

    /**
     * New user sign-ups in the last 30 days.
     */
    private long newUsersLast30Days;

    /**
     * Customers who placed at least one order.
     */
    private long activeCustomers;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopSellingFoodItem {
        private String foodItemName;
        private long totalQuantitySold;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ActiveRestaurant {
        private String restaurantName;
        private long orderCount;
    }
}
