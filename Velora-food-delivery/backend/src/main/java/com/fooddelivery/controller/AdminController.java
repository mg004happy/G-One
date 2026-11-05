package com.fooddelivery.controller;

import com.fooddelivery.dto.DashboardStatsResponse;
import com.fooddelivery.dto.OrderAnalyticsResponse;
import com.fooddelivery.dto.OrderResponse;
import com.fooddelivery.dto.RevenueAnalyticsResponse;
import com.fooddelivery.dto.UpdateUserStatusRequest;
import com.fooddelivery.dto.UserResponse;
import com.fooddelivery.dto.RestaurantEmployeeResponse;
import com.fooddelivery.dto.TieUpDepartureResponse;
import com.fooddelivery.entity.OrderStatus;
import com.fooddelivery.entity.Role;
import com.fooddelivery.service.AdminService;
import com.fooddelivery.service.RestaurantEmployeeService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for all admin operations: dashboard, user management,
 * restaurant management, order management, and analytics.
 *
 * <p>All endpoints are restricted to users with the {@code ADMIN} role.</p>
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final RestaurantEmployeeService restaurantEmployeeService;

    public AdminController(AdminService adminService, RestaurantEmployeeService restaurantEmployeeService) {
        this.adminService = adminService;
        this.restaurantEmployeeService = restaurantEmployeeService;
    }

    // =====================================================================
    // DASHBOARD
    // =====================================================================

    /**
     * Get dashboard overview statistics.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // =====================================================================
    // USER MANAGEMENT
    // =====================================================================

    /**
     * Get all users with pagination and optional search/role filter.
     *
     * @param search optional search term (name or email)
     * @param role   optional role filter
     * @param page   page number (0-indexed)
     * @param size   page size
     * @param sort   sort field (default: createdAt)
     * @param dir    sort direction (default: DESC)
     */
    @GetMapping("/users")
    public ResponseEntity<Page<UserResponse>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Role role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "DESC") Sort.Direction dir) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sort));

        Page<UserResponse> result;
        if (search != null && !search.isBlank()) {
            result = adminService.searchUsers(search, role, pageable);
        } else if (role != null) {
            result = adminService.getUsersByRole(role, pageable);
        } else {
            result = adminService.getAllUsers(pageable);
        }

        return ResponseEntity.ok(result);
    }

    /**
     * Get a specific user by ID.
     */
    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getUserById(id));
    }

    /**
     * Update a user's account status (ACTIVE, BLOCKED, SUSPENDED).
     */
    @PutMapping("/users/{id}/status")
    public ResponseEntity<UserResponse> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserStatusRequest request) {
        return ResponseEntity.ok(adminService.updateUserStatus(id, request));
    }

    /**
     * Delete a user.
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // =====================================================================
    // RESTAURANT MANAGEMENT
    // =====================================================================

    /**
     * Get all restaurants with pagination.
     */
    @GetMapping("/restaurants")
    public ResponseEntity<Page<?>> getRestaurants(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(adminService.getAllRestaurants(pageable));
    }

    /**
     * Approve a restaurant.
     */
    @PutMapping("/restaurants/{id}/approve")
    public ResponseEntity<String> approveRestaurant(@PathVariable Long id) {
        adminService.approveRestaurant(id);
        return ResponseEntity.ok("Restaurant approved successfully");
    }

    /**
     * Disable a restaurant.
     */
    @PutMapping("/restaurants/{id}/disable")
    public ResponseEntity<String> disableRestaurant(@PathVariable Long id) {
        adminService.disableRestaurant(id);
        return ResponseEntity.ok("Restaurant disabled successfully");
    }

    @GetMapping("/restaurants/{id}/employees")
    public ResponseEntity<List<RestaurantEmployeeResponse>> getRestaurantEmployees(@PathVariable Long id) {
        return ResponseEntity.ok(restaurantEmployeeService.listForAdmin(id));
    }

    @GetMapping("/restaurants/{id}/employees/departures")
    public ResponseEntity<List<TieUpDepartureResponse>> getRestaurantTieUpDepartures(@PathVariable Long id) {
        return ResponseEntity.ok(restaurantEmployeeService.listTieUpDeparturesForAdmin(id));
    }

    /**
     * Delete a restaurant.
     */
    @DeleteMapping("/restaurants/{id}")
    public ResponseEntity<Void> deleteRestaurant(@PathVariable Long id) {
        adminService.deleteRestaurant(id);
        return ResponseEntity.noContent().build();
    }

    // =====================================================================
    // ORDER MANAGEMENT
    // =====================================================================

    /**
     * Get all orders with pagination and optional status/restaurant filter.
     *
     * @param status       optional order status filter
     * @param restaurantId optional restaurant filter
     * @param page         page number (0-indexed)
     * @param size         page size
     */
    @GetMapping("/orders")
    public ResponseEntity<Page<OrderResponse>> getOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) Long restaurantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<OrderResponse> result;
        if (status != null) {
            result = adminService.getOrdersByStatus(status, pageable);
        } else if (restaurantId != null) {
            result = adminService.getOrdersByRestaurant(restaurantId, pageable);
        } else {
            result = adminService.getAllOrders(pageable);
        }

        return ResponseEntity.ok(result);
    }

    /**
     * Get a specific order by ID.
     */
    @GetMapping("/orders/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getOrderById(id));
    }

    // =====================================================================
    // ANALYTICS
    // =====================================================================

    /**
     * Get order analytics (status distribution, top foods, active restaurants).
     */
    @GetMapping("/analytics/orders")
    public ResponseEntity<OrderAnalyticsResponse> getOrderAnalytics() {
        return ResponseEntity.ok(adminService.getOrderAnalytics());
    }

    /**
     * Get daily revenue for the last N days (default: 30).
     */
    @GetMapping("/analytics/revenue")
    public ResponseEntity<List<RevenueAnalyticsResponse>> getRevenueAnalytics(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(adminService.getDailyRevenue(days));
    }
}
