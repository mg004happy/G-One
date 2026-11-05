package com.fooddelivery.entity;

/**
 * Enum representing user roles in the food delivery system.
 * Each role maps to a Spring Security granted authority prefixed with "ROLE_".
 */
public enum Role {
    CUSTOMER,
    ADMIN,
    RESTAURANT_OWNER
}
