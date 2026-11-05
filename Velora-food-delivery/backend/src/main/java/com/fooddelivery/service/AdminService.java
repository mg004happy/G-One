package com.fooddelivery.service;

import com.fooddelivery.dto.DashboardStatsResponse;
import com.fooddelivery.dto.OrderAnalyticsResponse;
import com.fooddelivery.dto.OrderResponse;
import com.fooddelivery.dto.RevenueAnalyticsResponse;
import com.fooddelivery.dto.UpdateUserStatusRequest;
import com.fooddelivery.dto.UserResponse;
import com.fooddelivery.entity.OrderStatus;
import com.fooddelivery.entity.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service interface for admin dashboard, user management,
 * restaurant management, and analytics.
 */
public interface AdminService {

    // ---- Dashboard ----

    DashboardStatsResponse getDashboardStats();

    // ---- User Management ----

    Page<UserResponse> getAllUsers(Pageable pageable);

    Page<UserResponse> searchUsers(String search, Pageable pageable);

    Page<UserResponse> searchUsers(String search, Role role, Pageable pageable);

    Page<UserResponse> getUsersByRole(Role role, Pageable pageable);

    UserResponse getUserById(Long id);

    UserResponse updateUserStatus(Long id, UpdateUserStatusRequest request);

    void deleteUser(Long id);

    // ---- Restaurant Management ----

    Page<com.fooddelivery.dto.RestaurantResponse> getAllRestaurants(Pageable pageable);

    void approveRestaurant(Long restaurantId);

    void disableRestaurant(Long restaurantId);

    void deleteRestaurant(Long restaurantId);

    // ---- Order Management ----

    Page<OrderResponse> getAllOrders(Pageable pageable);

    Page<OrderResponse> getOrdersByStatus(OrderStatus status, Pageable pageable);

    Page<OrderResponse> getOrdersByRestaurant(Long restaurantId, Pageable pageable);

    OrderResponse getOrderById(Long orderId);

    // ---- Analytics ----

    OrderAnalyticsResponse getOrderAnalytics();

    List<RevenueAnalyticsResponse> getDailyRevenue(int days);
}
