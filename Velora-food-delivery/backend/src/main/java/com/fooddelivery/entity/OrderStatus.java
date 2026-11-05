package com.fooddelivery.entity;

/**
 * Enum representing the lifecycle status of an order.
 */
public enum OrderStatus {
    PENDING,
    CONFIRMED,
    PREPARING,
    OUT_FOR_DELIVERY,
    DELIVERED,
    CANCELLED
}
