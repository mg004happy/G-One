package com.fooddelivery.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * DTO for the admin dashboard overview statistics.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {

    // ---- User Stats ----
    private long totalUsers;
    private long totalCustomers;
    private long totalRestaurantOwners;
    private long totalAdmins;

    // ---- Restaurant Stats ----
    private long totalRestaurants;
    private long totalApprovedRestaurants;
    private long totalPendingRestaurants;

    // ---- Food Stats ----
    private long totalFoodItems;

    // ---- Order Stats ----
    private long totalOrders;
    private long totalCompletedOrders;
    private long totalCancelledOrders;
    private long totalPendingOrders;

    // ---- Revenue Stats ----
    private BigDecimal totalRevenue;
    private BigDecimal todayRevenue;
    private BigDecimal monthlyRevenue;
}
