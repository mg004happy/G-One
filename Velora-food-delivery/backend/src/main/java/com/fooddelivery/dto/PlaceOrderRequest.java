package com.fooddelivery.dto;

import com.fooddelivery.entity.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO for placing a new order from the current user's cart.
 *
 * <p>The customer can either provide an {@code addressId} to use a saved address,
 * or fall back to providing {@code deliveryAddress} and {@code phoneNumber} directly.
 * If {@code addressId} is provided, the address fields are populated from the saved address.</p>
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaceOrderRequest {

    /**
     * ID of a saved address to use for delivery.
     * If provided, deliveryAddress and phoneNumber are populated from this address.
     */
    private Long addressId;

    /**
     * Manual delivery address (used when addressId is not provided).
     */
    private String deliveryAddress;

    /**
     * Manual phone number (used when addressId is not provided).
     */
    @Pattern(regexp = "^\\+?[0-9]{7,15}$", message = "Please provide a valid phone number")
    private String phoneNumber;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;
}
