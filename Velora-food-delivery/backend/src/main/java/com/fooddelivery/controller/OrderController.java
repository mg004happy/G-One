package com.fooddelivery.controller;

import com.fooddelivery.dto.OrderResponse;
import com.fooddelivery.dto.PlaceOrderRequest;
import com.fooddelivery.dto.UpdateOrderStatusRequest;
import com.fooddelivery.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for order operations.
 *
 * <h3>Authorization:</h3>
 * <ul>
 *   <li><strong>Place / View / Cancel</strong> — CUSTOMER only.</li>
 *   <li><strong>Update status</strong> — RESTAURANT_OWNER only.</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * Place a new order from the customer's cart.
     *
     * @param request delivery details and payment method
     * @return 201 Created with the new order
     */
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderResponse> placeOrder(
            @Valid @RequestBody PlaceOrderRequest request) {
        OrderResponse response = orderService.placeOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get all orders for the authenticated customer.
     *
     * @return 200 OK with list of orders
     */
    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<OrderResponse>> getMyOrders() {
        List<OrderResponse> orders = orderService.getMyOrders();
        return ResponseEntity.ok(orders);
    }

    /**
     * Get a specific order by ID.
     * Customers can only view their own orders.
     *
     * @param id the order ID
     * @return 200 OK with the order details
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        OrderResponse response = orderService.getOrderById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Cancel an order. Only PENDING/CONFIRMED/PREPARING orders can be cancelled.
     *
     * @param id the order to cancel
     * @return 200 OK with the cancelled order
     */
    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderResponse> cancelOrder(@PathVariable Long id) {
        OrderResponse response = orderService.cancelOrder(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all orders for the authenticated restaurant owner's restaurants.
     *
     * @return 200 OK with list of orders
     */
    @GetMapping("/restaurant")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<List<OrderResponse>> getRestaurantOrders() {
        List<OrderResponse> orders = orderService.getRestaurantOrders();
        return ResponseEntity.ok(orders);
    }

    /**
     * Update order status. Only the restaurant owner can update.
     *
     * @param id      the order to update
     * @param request the new status
     * @return 200 OK with the updated order
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        OrderResponse response = orderService.updateOrderStatus(id, request);
        return ResponseEntity.ok(response);
    }
}
