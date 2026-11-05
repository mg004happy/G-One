package com.fooddelivery.service;

import com.fooddelivery.dto.OrderResponse;
import com.fooddelivery.dto.PlaceOrderRequest;
import com.fooddelivery.dto.UpdateOrderStatusRequest;

import java.util.List;

/**
 * Service interface for order management operations.
 */
public interface OrderService {

    /**
     * Place a new order from the authenticated customer's cart.
     * Cart items are copied into order items and the cart is cleared.
     *
     * @param request delivery address, phone, and payment method
     * @return the newly created order
     */
    OrderResponse placeOrder(PlaceOrderRequest request);

    /**
     * Get all orders for the authenticated customer, most recent first.
     *
     * @return list of the customer's orders
     */
    List<OrderResponse> getMyOrders();

    /**
     * Get a specific order by ID. Customers can only view their own orders.
     *
     * @param orderId the order ID
     * @return the order details
     */
    OrderResponse getOrderById(Long orderId);

    /**
     * Cancel an order. Only the customer who placed it can cancel,
     * and only if the order has not been delivered.
     *
     * @param orderId the order to cancel
     * @return the updated order
     */
    OrderResponse cancelOrder(Long orderId);

    /**
     * Update the status of an order. Only the restaurant owner can do this.
     *
     * @param orderId the order to update
     * @param request the new status
     * @return the updated order
     */
    OrderResponse updateOrderStatus(Long orderId, UpdateOrderStatusRequest request);

    /**
     * Get all orders in the system (admin only), most recent first.
     *
     * @return all orders
     */
    List<OrderResponse> getAllOrders();

    /**
     * Get all orders for the authenticated restaurant owner's restaurants.
     *
     * @return orders for the owner's restaurants, most recent first
     */
    List<OrderResponse> getRestaurantOrders();
}
